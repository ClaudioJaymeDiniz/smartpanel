import { useCallback } from 'react';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { useFormStore } from '../store/useFormStore';
import { FormCreate } from '@/core/forms/domain/entities/Form';

export function useForms() {
  const repository = new FormRepositoryImpl();
  
  // Estados do Zustand
  const { 
    projectForms, 
    selectedForm,
    isLoading, 
    setProjectForms, 
    setSelectedForm,
    setLoading 
  } = useFormStore();

  // Busca todos os formulários de um projeto específico
  const fetchFormsByProject = useCallback(async (projectId: string) => {
    setLoading(true);
    try {
      const data = await repository.getByProject(projectId);
      setProjectForms(data);
    } catch (error) {
      console.error("Erro ao carregar formulários do projeto:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Criação de um novo formulário dinâmico
  const createForm = async (data: FormCreate) => {
    setLoading(true);
    try {
      const newForm = await repository.create(data);
      setProjectForms([...projectForms, newForm]);
      return newForm;
    } finally {
      setLoading(false);
    }
  };

  // Seleciona um formulário para ver detalhes ou responder
  const selectForm = (id: string) => {
    const form = projectForms.find(f => f.id === id) || null;
    setSelectedForm(form);
  };

  // Gera a URL de exportação para usar com Linking.openURL
  const getCsvExportUrl = (formId: string) => {
    return repository.getExportUrl(formId);
  };

  return {
    forms: projectForms,
    selectedForm,
    isLoading,
    fetchFormsByProject,
    createForm,
    selectForm,
    getCsvExportUrl
  };
}