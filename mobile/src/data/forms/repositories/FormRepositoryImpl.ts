import { api } from '@/services/api';
import { IFormRepository } from '@/core/forms/domain/repositories/IFormRepository';
import { Form, FormCreate } from '@/core/forms/domain/entities/Form';
import { FormMapper } from '@/core/forms/mappers/FormMapper';
import * as FileSystem from 'expo-file-system/legacy';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('smartpanel.db');

export class FormRepositoryImpl implements IFormRepository {

  async getPublicForms(): Promise<any[]> {
    try {
      const response = await api.get('/forms/public');
      return response.data;
    } catch (error) {
      return [];
    }
  }

  // 1. CRIAR FORMULÁRIO
  async create(data: FormCreate): Promise<Form> {
    try {
      const response = await api.post('/forms/', data);
      const created = response.data;

      try {
        db.runSync(
          'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
          [created.id, created.projectId, JSON.stringify(created)]
        );
      } catch (cacheError) {
        console.warn('Erro ao salvar formulario no cache:', cacheError);
      }

      return FormMapper.toDomain(created);
    } catch (error) {
      const tempId = `temp-form-${Date.now()}`;

      // Offline: Salva na fila para o useSync criar no backend depois
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        ['/forms/', JSON.stringify(data), 'POST', 'pending']
      );

      // Salva imediatamente no cache de formularios para aparecer offline.
      const localForm = {
        id: tempId,
        ...data,
        createdAt: new Date().toISOString(),
        deletedAt: null,
      };

      try {
        db.runSync(
          'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
          [tempId, data.projectId, JSON.stringify(localForm)]
        );
      } catch (cacheError) {
        console.warn('Erro ao salvar formulario offline no cache:', cacheError);
      }

      // Retorna um objeto temporário para a interface
      return {
        id: tempId,
        ...data,
        createdAt: new Date(),
        deletedAt: null,
      } as Form;
    }
  }

  // 2. BUSCAR FORMULÁRIOS POR PROJETO (Independente do Cache de Projetos)
  async getByProject(projectId: string): Promise<Form[]> {
    try {
      const response = await api.get(`/forms/project/${projectId}`);
      const forms = response.data;
      
      // Sincroniza o cache local de formulários para este projeto
      try {
        db.runSync('DELETE FROM forms WHERE project_id = ?', [projectId]);
        db.runSync('DELETE FROM forms_cache WHERE projectId = ?', [projectId]);
        for (const f of forms) {
          db.runSync(
            'INSERT OR REPLACE INTO forms (id, project_id, title, data) VALUES (?, ?, ?, ?)',
            [f.id, projectId, f.title || f.name, JSON.stringify(f)]
          );
          db.runSync(
            'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
            [f.id, projectId, JSON.stringify(f)]
          );
        }
      } catch (cacheError) {
        console.warn("Erro ao sincronizar cache de forms:", cacheError);
      }
            
      return FormMapper.toDomainList(forms);
    } catch (error) {
      console.warn("Offline: buscando formulários no cache local.");
      
      // Fallback: Busca na tabela específica de formulários
      try {
        const cache: any[] = db.getAllSync(
          'SELECT data FROM forms_cache WHERE projectId = ?', 
          [projectId]
        );

        if (cache.length > 0) {
          return FormMapper.toDomainList(cache.map(c => JSON.parse(c.data)));
        }
      } catch (cacheError) {
        console.warn("Erro ao buscar forms_cache:", cacheError);
      }

      // Último recurso: Tenta dentro do projeto
      try {
        const projectResult: any = db.getFirstSync('SELECT data FROM projects_cache WHERE id = ?', [projectId]);
        if (projectResult) {
          const projectData = JSON.parse(projectResult.data);
          return FormMapper.toDomainList(projectData.forms || []);
        }
      } catch (projectCacheError) {
        console.warn("Erro ao buscar projeto do cache:", projectCacheError);
      }

      return [];
    }
  }

  // 3. BUSCAR FORMULÁRIO POR ID (Muito mais rápido agora)
  async getById(id: string): Promise<Form> {
  try {
    const response = await api.get(`/forms/${id}`);
    const formData = response.data;

    // SALVA NO CACHE PARA USO FUTURO OFFLINE
    try {
      db.runSync(
        'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
        [id, formData.projectId || null, JSON.stringify(formData)]
      );
    } catch (cacheError) {
      console.warn("Erro ao salvar form no cache:", cacheError);
    }

    return FormMapper.toDomain(formData);
  } catch (error) {
    // SE FALHAR A API, BUSCA NO CACHE
    try {
      const result: any = db.getFirstSync('SELECT data FROM forms_cache WHERE id = ?', [id]);
      
      if (result && result.data) {
        return FormMapper.toDomain(JSON.parse(result.data));
      }
    } catch (cacheError) {
      console.warn("Erro ao buscar form do cache:", cacheError);
    }

    throw new Error("Formulário não disponível offline. Conecte-se uma vez para baixar.");
  }
}

  // 4. ATUALIZAR FORMULÁRIO
  async update(id: string, data: Partial<FormCreate>): Promise<Form> {
    try {
      const response = await api.patch(`/forms/${id}`, data);
      const updated = response.data;

      try {
        db.runSync(
          'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
          [updated.id, updated.projectId, JSON.stringify(updated)]
        );
      } catch (cacheError) {
        console.warn('Erro ao atualizar cache do formulario:', cacheError);
      }

      return FormMapper.toDomain(updated);
    } catch (error) {
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        [`/forms/${id}`, JSON.stringify(data), 'PATCH', 'pending']
      );
      
      // Retorno genérico (será atualizado no próximo sync)
      return { id, ...data } as any;
    }
  }

  // 5. ANALYTICS (Geralmente requer conexão)
  async getAnalytics(id: string): Promise<any> {
    try {
      const response = await api.get(`/forms/${id}/analytics`);
      return response.data;
    } catch (error) {
      return { total: 0, daily: [], message: "Dados indisponíveis offline" };
    }
  }

  // 6. URL DE EXPORTAÇÃO
  getExportUrl(id: string): string {
    return `${api.defaults.baseURL}/forms/${id}/export/csv`;
  }

  async downloadResponsesCsv(id: string): Promise<string> {
    const token = await SecureStore.getItemAsync('user_token');
    const url = this.getExportUrl(id);
    const baseDirectory = FileSystem.documentDirectory ?? FileSystem.cacheDirectory;

    if (!baseDirectory) {
      throw new Error('Nao foi possivel definir um diretorio local para o CSV.');
    }

    const destination = `${baseDirectory}respostas_form_${id.slice(0, 8)}.csv`;

    try {
      const result = await FileSystem.downloadAsync(url, destination, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      return result.uri;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as any)?.detail;
        throw new Error(detail || 'Falha ao baixar o CSV.');
      }

      throw new Error('Falha ao baixar o CSV.');
    }
  }

  async archive(id: string): Promise<void> {
    try {
      const response = await api.delete(`/forms/${id}`);
      const archived = response.data;

      try {
        db.runSync(
          'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
          [archived.id, archived.projectId, JSON.stringify(archived)]
        );
      } catch (cacheError) {
        console.warn('Erro ao atualizar cache do formulario arquivado:', cacheError);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        db.runSync(
          'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
          [`/forms/${id}`, JSON.stringify({}), 'DELETE', 'pending']
        );

        try {
          const current: any = db.getFirstSync('SELECT data FROM forms_cache WHERE id = ?', [id]);
          if (current?.data) {
            const cached = JSON.parse(current.data);
            cached.deletedAt = new Date().toISOString();
            db.runSync('UPDATE forms_cache SET data = ? WHERE id = ?', [JSON.stringify(cached), id]);
          }
        } catch (cacheError) {
          console.warn('Erro ao arquivar formulario no cache local:', cacheError);
        }

        return;
      }

      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as any)?.detail;
        throw new Error(detail || 'Falha ao arquivar o formulario.');
      }

      throw new Error('Falha ao arquivar o formulario.');
    }
  }

  async restore(id: string): Promise<void> {
    try {
      const response = await api.post(`/forms/${id}/restore`);
      const restored = response.data;

      try {
        db.runSync(
          'INSERT OR REPLACE INTO forms_cache (id, projectId, data) VALUES (?, ?, ?)',
          [restored.id, restored.projectId, JSON.stringify(restored)]
        );
      } catch (cacheError) {
        console.warn('Erro ao atualizar cache do formulario restaurado:', cacheError);
      }
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        db.runSync(
          'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
          [`/forms/${id}/restore`, JSON.stringify({}), 'POST', 'pending']
        );

        try {
          const current: any = db.getFirstSync('SELECT data FROM forms_cache WHERE id = ?', [id]);
          if (current?.data) {
            const cached = JSON.parse(current.data);
            cached.deletedAt = null;
            db.runSync('UPDATE forms_cache SET data = ? WHERE id = ?', [JSON.stringify(cached), id]);
          }
        } catch (cacheError) {
          console.warn('Erro ao restaurar formulario no cache local:', cacheError);
        }

        return;
      }

      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as any)?.detail;
        throw new Error(detail || 'Falha ao restaurar o formulario.');
      }

      throw new Error('Falha ao restaurar o formulario.');
    }
  }

  async permanentDelete(id: string): Promise<void> {
    try {
      await api.delete(`/forms/${id}/permanent`);
      db.runSync('DELETE FROM forms_cache WHERE id = ?', [id]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as any)?.detail;
        throw new Error(detail || 'Exclusao definitiva requer conexao e formulario arquivado.');
      }

      throw new Error('Exclusao definitiva requer conexao e formulario arquivado.');
    }
  }
}