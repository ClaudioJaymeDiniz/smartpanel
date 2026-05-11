import { Project, ProjectCreate } from '../entities/Project';

export interface IProjectRepository {
  listActive(): Promise<Project[]>;
  listArchived(): Promise<Project[]>;
  getById(id: string): Promise<Project>;
  create(data: ProjectCreate): Promise<Project>;
  update(id: string, data: Partial<ProjectCreate>): Promise<Project>;
  archive(id: string): Promise<void>;
  restore(id: string): Promise<void>;
  permanentDelete(id: string): Promise<void>;
}