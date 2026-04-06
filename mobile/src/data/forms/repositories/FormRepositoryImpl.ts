import { api } from '@/services/api';
import { IFormRepository } from '@/core/forms/domain/repositories/IFormRepository';
import { Form, FormCreate } from '@/core/forms/domain/entities/Form';
import { FormMapper } from '@/core/forms/mappers/FormMapper';
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
      return FormMapper.toDomain(response.data);
    } catch (error) {
      // Offline: Salva na fila para o useSync criar no backend depois
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        ['/forms/', JSON.stringify(data), 'POST', 'pending']
      );

      // Retorna um objeto temporário para a interface
      return {
        id: `temp-form-${Date.now()}`,
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
        for (const f of forms) {
          db.runSync(
            'INSERT OR REPLACE INTO forms (id, project_id, title, data) VALUES (?, ?, ?, ?)',
            [f.id, projectId, f.title || f.name, JSON.stringify(f)]
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
        'INSERT OR REPLACE INTO forms_cache (id, data) VALUES (?, ?)',
        [id, JSON.stringify(formData)]
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
      return FormMapper.toDomain(response.data);
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
}