import { api } from '@/services/api';
import { IProjectRepository } from '@/core/projects/domain/repositories/IProjectRepository';
import { Project, ProjectCreate } from '@/core/projects/domain/entities/Project';
import { ProjectMapper } from '@/core/projects/mappers/ProjectMappers';
import axios from 'axios';

import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('smartpanel.db');

function dedupeProjects(projects: Project[]): Project[] {
  const result: Project[] = [];
  const realNames = new Set<string>();
  const tempIndexByName = new Map<string, number>();

  for (const project of projects) {
    const normalizedName = (project.name || '').trim().toLowerCase();

    if (project.id.startsWith('temp-')) {
      if (normalizedName && realNames.has(normalizedName)) {
        continue;
      }

      if (normalizedName && tempIndexByName.has(normalizedName)) {
        continue;
      }

      if (normalizedName) {
        tempIndexByName.set(normalizedName, result.length);
      }

      result.push(project);
      continue;
    }

    if (normalizedName) {
      realNames.add(normalizedName);

      const tempIndex = tempIndexByName.get(normalizedName);
      if (typeof tempIndex === 'number') {
        result[tempIndex] = project;
        tempIndexByName.delete(normalizedName);
        continue;
      }
    }

    result.push(project);
  }

  return result;
}

export class ProjectRepositoryImpl implements IProjectRepository {
  
  // 1. LISTAR ATIVOS
  async listActive(): Promise<Project[]> {
    try {
      const response = await api.get('/projects/');
      const projects = response.data;

      // Sincroniza o cache local
      try {
        db.runSync("DELETE FROM projects_cache WHERE id LIKE 'temp-%'");
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
      
      return ProjectMapper.toDomainList(dedupeProjects(projects));
    } catch (error) {
      // Fallback para o SQLite
      try {
        const cache: any[] = db.getAllSync('SELECT data FROM projects_cache');
        if (cache.length > 0) {
          return ProjectMapper.toDomainList(dedupeProjects(cache.map(c => JSON.parse(c.data))));
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
      try {
        const created = response.data;
        db.runSync(
          'INSERT OR REPLACE INTO projects_cache (id, name, data) VALUES (?, ?, ?)',
          [created.id, created.name, JSON.stringify(created)]
        );
      } catch (cacheError) {
        console.warn('Erro ao atualizar cache local de projeto:', cacheError);
      }
      return ProjectMapper.toDomain(response.data);
    } catch (error) {
      const tempId = `temp-${Date.now()}`;

      // Salva na fila de sincronismo
      const queuedPayload = { ...data, _localTempId: tempId };
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        ['/projects/', JSON.stringify(queuedPayload), 'POST', 'pending']
      );

      // Mantem no cache local para aparecer normalmente no offline.
      const localProject = {
        id: tempId,
        ...data,
        ownerId: 'local',
        isPublic: false,
        deletedAt: null,
      };

      try {
        db.runSync(
          'INSERT OR REPLACE INTO projects_cache (id, name, data) VALUES (?, ?, ?)',
          [tempId, data.name, JSON.stringify(localProject)]
        );
      } catch (cacheError) {
        console.warn('Erro ao salvar projeto offline no cache:', cacheError);
      }

      return { 
        id: tempId,
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

  // 6. ARQUIVAR
  async archive(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}`);
      db.runSync('DELETE FROM projects_cache WHERE id = ?', [id]);
    } catch (error) {
      db.runSync(
        'INSERT INTO sync_queue (endpoint, payload, method, status) VALUES (?, ?, ?, ?)',
        [`/projects/${id}`, JSON.stringify({}), 'DELETE', 'pending']
      );
      db.runSync('DELETE FROM projects_cache WHERE id = ?', [id]);
    }
  }

  // 7. DELETAR PERMANENTE
  async permanentDelete(id: string): Promise<void> {
    try {
      await api.delete(`/projects/${id}/permanent`);
      db.runSync('DELETE FROM projects_cache WHERE id = ?', [id]);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const detail = (error.response?.data as any)?.detail;
        throw new Error(detail || 'Exclusao definitiva requer conexao e projeto arquivado.');
      }

      throw new Error('Exclusao definitiva requer conexao e projeto arquivado.');
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