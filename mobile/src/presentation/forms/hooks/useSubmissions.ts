import { useState } from 'react';
import { SubmitFormUseCase } from '@/core/forms/usecases/SubmitFormUseCase';
import { SubmissionRepositoryImpl } from '@/data/forms/repositories/SubmissionRepositoryImpl';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

export function useSubmissions() {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthStore(); // Pega o usuário logado
  
  const repo = new SubmissionRepositoryImpl();
  const useCase = new SubmitFormUseCase(repo);

  const submitForm = async (formId: string, answers: Record<string, any>) => {
    if (!user?.id) throw new Error("Usuário não identificado");
    
    setSubmitting(true);
    try {
      return await useCase.execute(formId, answers, user.id);
    } finally {
      setSubmitting(false);
    }
  };

  return { submitForm, submitting };
}