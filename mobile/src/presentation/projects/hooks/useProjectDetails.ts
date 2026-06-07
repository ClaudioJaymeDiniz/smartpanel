import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from 'expo-router';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useProjectStore } from '@/presentation/projects/store/useProjectStore';

export function useProjectDetails() {
  const { id, name: initialName } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'forms' | 'members'>('forms');

  const { user } = useAuthStore();
  const { setSelectedProject } = useProjectStore();

  const isOwner = project?.ownerId === user?.id;
  const projectId = id as string;

  const loadProjectData = useCallback(async () => {
    if (!refreshing) setLoading(true);
    try {
      const projectRepo = new ProjectRepositoryImpl();
      const formRepo = new FormRepositoryImpl();

      const projectData = await projectRepo.findById(projectId);
      setProject(projectData);
      setSelectedProject(projectData);

      const formsData = await formRepo.getByProject(projectId);
      setForms(formsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [projectId, refreshing, setSelectedProject]);

  // Limpa o projeto selecionado ao desmontar
  useEffect(() => {
    return () => setSelectedProject(null);
  }, [setSelectedProject]);

  // Recarrega os dados sempre que a tela focar
  useFocusEffect(
    useCallback(() => {
      loadProjectData();
    }, [loadProjectData])
  );

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadProjectData();
  }, [loadProjectData]);

  return {
    projectId,
    initialName,
    project,
    forms,
    loading,
    refreshing,
    activeSection,
    isOwner,
    router,
    navigation,
    setActiveSection,
    handleRefresh,
  };
}