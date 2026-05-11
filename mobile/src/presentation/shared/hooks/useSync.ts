import { useCallback, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { api } from '@/services/api';
import { SubmissionRepositoryImpl } from '@/data/forms/repositories/SubmissionRepositoryImpl';

const db = SQLite.openDatabaseSync('smartpanel.db');
const submissionRepository = new SubmissionRepositoryImpl();

function mapProjectIdInPayload(payload: any, idMap: Map<string, string>): any {
  if (Array.isArray(payload)) {
    return payload.map((item) => mapProjectIdInPayload(item, idMap));
  }

  if (payload && typeof payload === 'object') {
    const next: Record<string, any> = {};
    for (const [key, value] of Object.entries(payload)) {
      if (key === 'projectId' && typeof value === 'string' && idMap.has(value)) {
        next[key] = idMap.get(value);
      } else {
        next[key] = mapProjectIdInPayload(value, idMap);
      }
    }
    return next;
  }

  return payload;
}

function resolveEndpointWithProjectMap(endpoint: string, idMap: Map<string, string>) {
  let resolved = endpoint;
  for (const [tempId, realId] of idMap.entries()) {
    resolved = resolved.replace(tempId, realId);
  }
  return resolved;
}

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const clearLegacySyncQueue = useCallback(() => {
    // Remove duplicatas de delete permanente para o mesmo endpoint.
    db.runSync(
      `DELETE FROM sync_queue
       WHERE method = "DELETE"
         AND endpoint LIKE "/projects/%/permanent"
         AND id NOT IN (
           SELECT MIN(id)
           FROM sync_queue
           WHERE method = "DELETE" AND endpoint LIKE "/projects/%/permanent"
           GROUP BY endpoint, method
         )`
    );

    // Remove qualquer acao legada de exclusao permanente ja marcada como erro.
    db.runSync(
      `DELETE FROM sync_queue
       WHERE method = "DELETE"
         AND endpoint LIKE "/projects/%/permanent"
         AND status = "error"`
    );
  }, []);

  const syncPendingActions = useCallback(async () => {
    // Limpa residuos legados antes do sincronismo real.
    clearLegacySyncQueue();

    // 1. Busca todas as ações pendentes no SQLite
    const pending: any[] = db.getAllSync(
      'SELECT * FROM sync_queue WHERE status = "pending" OR status = "error" OR status IS NULL ORDER BY id ASC'
    );

    if (pending.length === 0) return;

    setIsSyncing(true);
    console.log(`🔄 Sincronismo iniciado: ${pending.length} itens pendentes.`);

    const tempProjectIdMap = new Map<string, string>();

    for (const action of pending) {
      try {
        const rawPayload = JSON.parse(action.payload);
        const payload = mapProjectIdInPayload(rawPayload, tempProjectIdMap);
        const endpoint = resolveEndpointWithProjectMap(action.endpoint, tempProjectIdMap);
        
        // 2. Tenta executar a chamada de rede baseada no método salvo
        if (endpoint.startsWith('/submissions') && action.method === 'POST') {
          await submissionRepository.send(payload);
        } else if (endpoint.startsWith('/submissions') && action.method === 'PATCH') {
          const submissionId = payload.id || endpoint.split('/').filter(Boolean).pop();
          await submissionRepository.update(submissionId, payload.formData ?? payload);
        } else if (endpoint === '/projects/' && action.method === 'POST') {
          const localTempId = payload._localTempId;
          const body = { ...payload };
          delete body._localTempId;

          const response = await api.post(endpoint, body);
          const createdProject = response.data;

          db.runSync(
            'INSERT OR REPLACE INTO projects_cache (id, name, data) VALUES (?, ?, ?)',
            [createdProject.id, createdProject.name, JSON.stringify(createdProject)]
          );

          if (localTempId && typeof localTempId === 'string') {
            tempProjectIdMap.set(localTempId, createdProject.id);

            db.runSync('DELETE FROM projects_cache WHERE id = ?', [localTempId]);
            db.runSync('UPDATE forms_cache SET projectId = ? WHERE projectId = ?', [createdProject.id, localTempId]);
          }
        } else if (endpoint === '/forms/' && action.method === 'POST') {
          const response = await api.post(endpoint, payload);
          const createdForm = response.data;

          db.runSync(
            'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
            [createdForm.id, createdForm.projectId, JSON.stringify(createdForm)]
          );
        } else if (action.method === 'POST') {
          await api.post(endpoint, payload);
        } else if (action.method === 'PATCH') {
          await api.patch(endpoint, payload);
        } else if (action.method === 'DELETE') {
          await api.delete(endpoint);
        }

        // 3. Se deu certo, remove da fila
        db.runSync('DELETE FROM sync_queue WHERE id = ?', [action.id]);
        db.runSync(
          'DELETE FROM sync_queue WHERE endpoint = ? AND method = ? AND (status = "pending" OR status = "error" OR status IS NULL)',
          [action.endpoint, action.method]
        );
        console.log(`✅ Sincronizado: ${endpoint}`);

      } catch (error: any) {
        const status = axios.isAxiosError(error) ? error.response?.status : undefined;
        const detail = axios.isAxiosError(error)
          ? ((error.response?.data as any)?.detail || error.message)
          : error?.message;
        const isPermanentDelete = action.method === 'DELETE' && action.endpoint.includes('/projects/') && action.endpoint.endsWith('/permanent');

        // Casos nao-retryable para exclusao permanente:
        // 400: nao arquivado; 403: sem permissao; 404: ja nao existe; 500: erro legado/estado inconsistente.
        if (isPermanentDelete && (status === 400 || status === 403 || status === 404 || status === 500)) {
          console.warn(`⚠️ Removendo da fila (nao-retryable) ${action.endpoint}:`, detail);
          db.runSync('DELETE FROM sync_queue WHERE id = ?', [action.id]);
          continue;
        }

        // Se falhar (ex: servidor offline / erro temporario), mantém para nova tentativa.
        console.error(`❌ Falha ao sincronizar ${action.endpoint}:`, detail || error?.message);

        // 5xx vira error para facilitar diagnostico; demais continuam pending.
        const nextStatus = status && status >= 500 ? 'error' : 'pending';
        db.runSync('UPDATE sync_queue SET status = ? WHERE id = ?', [nextStatus, action.id]);
      }
    }

    try {
      const response = await api.get('/projects/');
      const projects = response.data || [];
      db.runSync("DELETE FROM projects_cache WHERE id LIKE 'temp-%'");
      db.runSync('DELETE FROM projects_cache');
      for (const p of projects) {
        db.runSync(
          'INSERT OR REPLACE INTO projects_cache (id, name, data) VALUES (?, ?, ?)',
          [p.id, p.name, JSON.stringify(p)]
        );
      }
    } catch (cacheRefreshError) {
      console.warn('Nao foi possivel atualizar cache de projetos apos sincronismo:', cacheRefreshError);
    }

    setIsSyncing(false);
  }, [clearLegacySyncQueue]);

  return { syncPendingActions, clearLegacySyncQueue, isSyncing };
}