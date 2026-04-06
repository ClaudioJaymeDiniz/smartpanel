export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'number' 
  | 'date' 
  | 'select' 
  | 'checkbox' 
  | 'image' 
  | 'file';

export interface FormField {
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: string[];
}

export interface Form {
  id: string;
  title: string;
  description?: string; 
  isPublic: boolean;
  structure: FormField[];
  projectId: string;
  createdAt: Date;
  deletedAt: Date | null;
}

export interface FormCreate {
  title: string;
  description?: string;
  isPublic?: boolean;
  projectId: string;
  structure: FormField[];
}