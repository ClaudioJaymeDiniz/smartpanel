import { useState } from 'react';
import { CreateFormUseCase } from '@/core/forms/usecases/CreateFormUseCase';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { FormCreate } from '@/core/forms/domain/entities/Form';

export function useCreateForm() {
  const [loading, setLoading] = useState(false);
  const repo = new FormRepositoryImpl();
  const useCase = new CreateFormUseCase(repo);

  const createForm = async (data: FormCreate) => {
    setLoading(true);
    try {
      return await useCase.execute(data);
    } finally {
      setLoading(false);
    }
  };

  return { createForm, loading };
}