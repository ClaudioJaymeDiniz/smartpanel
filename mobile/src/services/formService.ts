import { api } from './api';
import * as SQLite from 'expo-sqlite';

// Abre o banco (mesmo nome usado no AuthContext)
const db = SQLite.openDatabaseSync('smartpanel.db');

export interface FormField {
  label: string;
  type: 'text' | 'number' | 'select' | 'image' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  structure: FormField[];
  projectId: string;
}



export const formService = {
  /**
   * Busca formulários de um projeto (Online ou Cache)
   */
  getProjectForms: async (projectId: string, isOffline: boolean): Promise<Form[]> => {
    if (isOffline) {
      // Busca no cache local (usando a tabela de projetos que já temos ou uma nova)
      const result: any = db.getFirstSync(
        'SELECT data FROM projects_cache WHERE id = ?',
        [projectId]
      );
      
      if (result) {
        const projectData = JSON.parse(result.data);
        return projectData.forms || [];
      }
      return [];
    }

    // Fluxo Online
    const response = await api.get(`/forms/project/${projectId}`);
    return response.data;
  },

  /**
   * Envia uma submissão (Resposta)
   */
  submitForm: async (formId: string, userId: string, data: any, isOffline: boolean) => {
    const submissionId = crypto.randomUUID(); // Gera o ID no Mobile
    const payload = {
      id: submissionId,
      formId,
      userId,
      formData: data,
    };

    if (isOffline) {
      // Salva na fila de sincronismo (tabela sync_queue do seu AuthContext)
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method) VALUES (?, ?, ?)',
        ['/submissions', JSON.stringify(payload), 'POST']
      );
      return { status: 'offline_saved', id: submissionId };
    }

    // Fluxo Online
    const response = await api.post('/submissions', payload);
    return response.data;
  }
};