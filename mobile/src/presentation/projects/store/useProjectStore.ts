import { create } from 'zustand';
import { Project } from '@/core/projects/domain/entities/Project';

interface ProjectState {
  projects: Project[];
  archivedProjects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;
  
  // Ações
  setProjects: (projects: Project[]) => void;
  setArchivedProjects: (projects: Project[]) => void;
  setSelectedProject: (project: Project | null) => void;
  setLoading: (loading: boolean) => void;
  
  // Auxiliar para atualizar um projeto na lista sem dar refetch
  updateProjectInList: (updatedProject: Project) => void;
}

export const useProjectStore = create<ProjectState>((set) => ({
  projects: [],
  archivedProjects: [],
  selectedProject: null,
  isLoading: false,

  setProjects: (projects) => set({ projects }),
  setArchivedProjects: (projects) => set({ archivedProjects: projects }),
  setSelectedProject: (selectedProject) => set({ selectedProject }),
  setLoading: (isLoading) => set({ isLoading }),

  updateProjectInList: (updatedProject) => set((state) => ({
    projects: state.projects.map((p) => p.id === updatedProject.id ? updatedProject : p)
  })),
}));