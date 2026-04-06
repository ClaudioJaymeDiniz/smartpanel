import { create } from 'zustand';
import { Form } from '@/core/forms/domain/entities/Form';

interface FormState {
  projectForms: Form[];
  selectedForm: Form | null;
  isLoading: boolean;
  setProjectForms: (forms: Form[]) => void;
  setSelectedForm: (form: Form | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useFormStore = create<FormState>((set) => ({
  projectForms: [],
  selectedForm: null,
  isLoading: false,
  setProjectForms: (projectForms) => set({ projectForms }),
  setSelectedForm: (selectedForm) => set({ selectedForm }),
  setLoading: (isLoading) => set({ isLoading }),
}));