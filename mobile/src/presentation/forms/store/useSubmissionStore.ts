import { create } from 'zustand';
import { Submission } from '@/core/forms/domain/entities/Submission';

interface SubmissionState {
  submissions: Submission[];
  isLoading: boolean;
  setSubmissions: (submissions: Submission[]) => void;
  addSubmission: (submission: Submission) => void;
  setLoading: (loading: boolean) => void;
}

export const useSubmissionStore = create<SubmissionState>((set) => ({
  submissions: [],
  isLoading: false,
  setSubmissions: (submissions) => set({ submissions }),
  addSubmission: (submission) => set((state) => ({ 
    submissions: [submission, ...state.submissions] 
  })),
  setLoading: (isLoading) => set({ isLoading }),
}));