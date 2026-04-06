import { useCallback, useState } from 'react';

import { Form } from '@/core/forms/domain/entities/Form';
import { Submission } from '@/core/forms/domain/entities/Submission';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { SubmissionRepositoryImpl } from '@/data/forms/repositories/SubmissionRepositoryImpl';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';

export function useFormDetails(formId: string, userId?: string) {
  const formRepo = new FormRepositoryImpl();
  const submissionRepo = new SubmissionRepositoryImpl();
  const projectRepo = new ProjectRepositoryImpl();

  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  const loadData = useCallback(async () => {
    if (!refreshing) setLoading(true);

    try {
      const [formData, responseData] = await Promise.all([
        formRepo.getById(formId),
        submissionRepo.listByForm(formId),
      ]);

      setForm(formData);
      setSubmissions(responseData);

      if (userId && formData?.projectId) {
        const projectData = await projectRepo.findById(formData.projectId);
        setIsOwner(projectData?.ownerId === userId);
      } else {
        setIsOwner(false);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formId, refreshing, userId]);

  const mySubmission = submissions.find((s) => s.userId === userId);

  return {
    form,
    submissions,
    loading,
    refreshing,
    isOwner,
    mySubmission,
    setRefreshing,
    loadData,
  };
}
