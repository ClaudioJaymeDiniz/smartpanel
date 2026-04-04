export interface FormField {
  label: string;
  type: 'text' | 'number' | 'select' | 'image' | 'checkbox';
  required: boolean;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  structure: FormField[];
  projectId: string;
}