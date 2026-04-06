export interface Submission {
  id: string; // Gerado no Mobile (UUID)
  formData: Record<string, any>; // Ex: { "Nome": "Claudio", "Idade": 30 }
  userId: string;
  formId: string;
  createdAt: Date;
  user?: { name: string; email: string }; // Dados do coletor (para o Dono ver)
}

export interface SubmissionCreate {
  id: string; 
  formId: string;
  formData: Record<string, any>;
}