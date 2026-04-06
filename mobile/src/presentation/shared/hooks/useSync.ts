import { useCallback, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { api } from '@/services/api';

const db = SQLite.openDatabaseSync('smartpanel.db');

export function useSync() {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncPendingActions = useCallback(async () => {
    // 1. Busca todas as ações pendentes no SQLite
    const pending: any[] = db.getAllSync(
      'SELECT * FROM sync_queue WHERE status = "pending" OR status IS NULL'
    );

    if (pending.length === 0) return;

    setIsSyncing(true);
    console.log(`🔄 Sincronismo iniciado: ${pending.length} itens pendentes.`);

    for (const action of pending) {
      try {
        const payload = JSON.parse(action.payload);
        
        // 2. Tenta executar a chamada de rede baseada no método salvo
        if (action.method === 'POST') {
          await api.post(action.endpoint, payload);
        } else if (action.method === 'PATCH') {
          await api.patch(action.endpoint, payload);
        } else if (action.method === 'DELETE') {
          await api.delete(action.endpoint);
        }

        // 3. Se deu certo, remove da fila
        db.runSync('DELETE FROM sync_queue WHERE id = ?', [action.id]);
        console.log(`✅ Sincronizado: ${action.endpoint}`);

      } catch (error: any) {
        // Se falhar (ex: servidor ainda offline), mantém na fila para a próxima tentativa
        console.error(`❌ Falha ao sincronizar ${action.endpoint}:`, error.message);
        
        // Opcional: Marcar como erro para não travar o loop infinitamente
        db.runSync('UPDATE sync_queue SET status = "error" WHERE id = ?', [action.id]);
      }
    }

    setIsSyncing(false);
  }, []);

  return { syncPendingActions, isSyncing };
}