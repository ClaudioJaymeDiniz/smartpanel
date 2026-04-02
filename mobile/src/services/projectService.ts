import * as SQLite from 'expo-sqlite';
import { api } from './api';

const db = SQLite.openDatabaseSync('smartpanel.db');

export const projectService = {
  
  // ADICIONE ESTA FUNÇÃO QUE ESTAVA FALTANDO
  async getAll(isOffline: boolean) {
    if (!isOffline) {
      try {
        const response = await api.get('/projects/');
        const projects = response.data;
        
        // Sincroniza o cache local (limpa e reinsere)
        db.runSync('DELETE FROM projects_cache');
        for (const p of projects) {
          db.runSync(
            'INSERT INTO projects_cache (id, name, data) VALUES (?, ?, ?)',
            [p.id, p.name, JSON.stringify(p)]
          );
        }
        return projects;
      } catch (error) {
        console.error("Erro ao buscar da API, tentando cache:", error);
      }
    }
    
    // Retorno do SQLite (Offline ou fallback)
    const cache: any[] = db.getAllSync('SELECT * FROM projects_cache');
    return cache.map(item => JSON.parse(item.data));
  },

  async create(data: any, isOffline: boolean) {
    const payload = {
      name: data.name,
      description: data.description || "",
      isPublic: false,
      logoUrl: "", 
      themeColor: data.themeColor.startsWith('#') ? data.themeColor : `#${data.themeColor}`
    };

    if (isOffline) {
      const tempId = `temp-${Date.now()}`;
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        ['/projects/', JSON.stringify(payload), 'POST', 'pending']
      );
      return { ...payload, id: tempId, offline: true };
    }

    const response = await api.post('/projects/', payload);
    return response.data;
  },

  async update(projectId: string, data: any, isOffline: boolean) {
  const payload = {
    ...data,
    // Garantia para o Pydantic do FastAPI não dar erro 422
    themeColor: data.themeColor?.startsWith('#') ? data.themeColor : `#${data.themeColor}`
  };

  if (isOffline) {
    // 1. Salva na fila de sincronização
    db.runSync(
      'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
      [`/projects/${projectId}`, JSON.stringify(payload), 'PATCH', 'pending']
    );

    // 2. Atualiza o cache local IMEDIATAMENTE (para o usuário ver a mudança mesmo offline)
    // Buscamos o dado antigo, mesclamos com o novo e salvamos de volta
    const current: any = db.getFirstSync('SELECT data FROM projects_cache WHERE id = ?', [projectId]);
    if (current) {
      const updatedData = { ...JSON.parse(current.data), ...payload, offline: true };
      db.runSync(
        'UPDATE projects_cache SET name = ?, data = ? WHERE id = ?',
        [payload.name || updatedData.name, JSON.stringify(updatedData), projectId]
      );
    }

    return { id: projectId, ...payload, offline: true };
  }

  // Lógica Online
  const response = await api.patch(`/projects/${projectId}`, payload);
  const updatedProject = response.data;

  // 3. ATUALIZAÇÃO CRÍTICA DO CACHE (Online)
  // Isso garante que ao voltar para a Home, o SQLite já tenha o nome/cor novos
  db.runSync(
    'UPDATE projects_cache SET name = ?, data = ? WHERE id = ?',
    [updatedProject.name, JSON.stringify(updatedProject), projectId]
  );

  return updatedProject;
},
  // Rota para a Lixeira (Soft Delete)
  async archive(projectId: string, isOffline: boolean) {
    if (isOffline) {
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        [`/projects/${projectId}`, JSON.stringify({}), 'DELETE', 'pending']
      );
      return { id: projectId, archived: true };
    }
    const response = await api.patch(`/projects/${projectId}`, { deletedAt: new Date() });
    return response.data;
  },

  async syncPendingActions() {
    const pending: any[] = db.getAllSync('SELECT * FROM sync_queue WHERE status = "pending"');
    for (const action of pending) {
      try {
        if (action.method === 'POST') await api.post(action.endpoint, JSON.parse(action.payload));
        if (action.method === 'PATCH') await api.patch(action.endpoint, JSON.parse(action.payload));
        db.runSync('DELETE FROM sync_queue WHERE id = ?', [action.id]);
      } catch (e) { console.error(e); }
    }
  }
};