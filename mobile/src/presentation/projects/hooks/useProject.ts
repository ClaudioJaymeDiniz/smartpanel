import { useCallback } from 'react';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';
import { useProjectStore } from '@/presentation/projects/store/useProjectStore';
import { ProjectCreate } from '@/core/projects/domain/entities/Project';

export function useProjects() {
  const repository = new ProjectRepositoryImpl();
  
  const { 
    projects, 
    isLoading, 
    setProjects, 
    setLoading, 
    setSelectedProject 
  } = useProjectStore();

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const data = await repository.listActive();
      setProjects(data);
    } catch (error) {
      console.error("Erro ao buscar projetos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const createNewProject = async (data: ProjectCreate) => {
    try {
      const newProject = await repository.create(data);
      // Atualiza a lista localmente para dar feedback imediato
      setProjects([newProject, ...projects]);
      return newProject;
    } catch (error) {
      throw error;
    }
  };

  const selectProject = (id: string) => {
    const project = projects.find(p => p.id === id) || null;
    setSelectedProject(project);
  };

  return {
    projects,
    isLoading,
    fetchProjects,
    createNewProject,
    selectProject
  };
}