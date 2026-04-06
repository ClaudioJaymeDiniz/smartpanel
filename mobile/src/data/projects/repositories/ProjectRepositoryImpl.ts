import { api } from '@/services/api';
import { IProjectRepository } from '@/core/projects/domain/repositories/IProjectRepository';
import { Project, ProjectCreate } from '@/core/projects/domain/entities/Project';
import { ProjectMapper } from '@/core/projects/mappers/ProjectMappers';

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('smartpanel.db');

export class ProjectRepositoryImpl implements IProjectRepository {
  
  // 1. LISTAR ATIVOS
  async listActive(): Promise<Project[]> {
    try {
      const response = await api.get('/projects/');
      const projects = response.data;

      // Sincroniza o cache local
      try {
        db.runSync('DELETE FROM projects_cache');
        for (const p of projects) {
          db.runSync(
            'INSERT INTO projects_cache (id, name, data) VALUES (?, ?, ?)',
            [p.id, p.name, JSON.stringify(p)]
          );
        }
      } catch (cacheError) {
        console.warn("Erro ao salvar cache:", cacheError);
        // Continua mesmo se o cache falhar
      }
      
      return ProjectMapper.toDomainList(projects);
    } catch (error) {
      // Fallback para o SQLite
      try {
        const cache: any[] = db.getAllSync('SELECT data FROM projects_cache');
        if (cache.length > 0) {
          return ProjectMapper.toDomainList(cache.map(c => JSON.parse(c.data)));
        }
      } catch (cacheError) {
        console.warn("Erro ao buscar cache local:", cacheError);
      }
      return [];
    }
  }

  // 2. LISTAR ARQUIVADOS (Lixeira)
  async listArchived(): Promise<Project[]> {
    try {
      const response = await api.get('/projects/archived');
      return ProjectMapper.toDomainList(response.data);
    } catch (error) {
      // Na lixeira offline, retornamos vazio ou você pode criar uma tabela projects_archived_cache
      return []; 
    }
  }

  // 3. BUSCAR POR ID
  async getById(id: string): Promise<Project> {
    try {
      const response = await api.get(`/projects/${id}`);
      return ProjectMapper.toDomain(response.data);
    } catch (error) {
      try {
        const result: any = db.getFirstSync('SELECT data FROM projects_cache WHERE id = ?', [id]);
        if (result) return ProjectMapper.toDomain(JSON.parse(result.data));
      } catch (cacheError) {
        console.warn("Erro ao buscar projeto do cache:", cacheError);
      }
      throw new Error("Projeto não encontrado localmente.");
    }
  }

  // 4. CRIAR PROJETO
  async create(data: ProjectCreate): Promise<Project> {
    try {
      const response = await api.post('/projects/', data);
      return ProjectMapper.toDomain(response.data);
    } catch (error) {
      // Salva na fila de sincronismo
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        ['/projects/', JSON.stringify(data), 'POST', 'pending']
      );
      return { 
        id: `temp-${Date.now()}`, 
        ...data, 
        ownerId: 'local', 
        isPublic: false, 
        deletedAt: null 
      } as Project;
    }
  }

  // 5. ATUALIZAR PROJETO
  async update(id: string, data: Partial<ProjectCreate>): Promise<Project> {
    try {
      const response = await api.patch(`/projects/${id}`, data);
      const updated = response.data;
      
      // Atualiza o cache local para refletir a mudança online
      db.runSync(
        'UPDATE projects_cache SET name = ?, data = ? WHERE id = ?',
        [updated.name, JSON.stringify(updated), id]
      );
      
      return ProjectMapper.toDomain(updated);
    } catch (error) {
      // Salva alteração na fila
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        [`/projects/${id}`, JSON.stringify(data), 'PATCH', 'pending']
      );
      
      // Atualiza o cache local IMEDIATAMENTE (UX)
      const current: any = db.getFirstSync('SELECT data FROM projects_cache WHERE id = ?', [id]);
      const updatedData = { ...JSON.parse(current.data), ...data };
      db.runSync('UPDATE projects_cache SET data = ? WHERE id = ?', [JSON.stringify(updatedData), id]);
      
      return ProjectMapper.toDomain(updatedData);
    }
  }

  // 6. RESTAURAR (Tirar da lixeira)
  async restore(id: string): Promise<void> {
    try {
      await api.post(`/projects/${id}/restore`);
    } catch (error) {
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        [`/projects/${id}/restore`, JSON.stringify({}), 'POST', 'pending']
      );
    }
  }

  // 7. DELETAR PERMANENTE
  async permanentDelete(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}/permanent`);
      db.runSync('DELETE FROM projects_cache WHERE id = ?', [id]);
    } catch (error) {
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        [`/projects/${id}/permanent`, JSON.stringify({}), 'DELETE', 'pending']
      );
      db.runSync('DELETE FROM projects_cache WHERE id = ?', [id]);
    }
  }
  // 8. BUSCAR POR ID (COMPLETO: API + FALLBACK CACHE)
  async findById(id: string): Promise<any> {
    try {
      const response = await api.get(`/projects/${id}`);
      const project = response.data;

      // Aproveita para atualizar o cache individual se a busca online deu certo
      db.runSync(
        'INSERT OR REPLACE INTO projects_cache (id, name, data) VALUES (?, ?, ?)',
        [project.id, project.name, JSON.stringify(project)]
      );

      return project;
    } catch (error) {
      console.warn("Offline: buscando detalhes do projeto no cache local.");
      
      // Tenta recuperar do SQLite caso a API falhe (sem internet no Linux Mint)
      const result: any = db.getFirstSync(
        'SELECT data FROM projects_cache WHERE id = ?', 
        [id]
      );

      if (result) {
        return JSON.parse(result.data);
      }

      throw new Error("Não foi possível carregar os detalhes do projeto (Offline e sem cache).");
    }
  }
}