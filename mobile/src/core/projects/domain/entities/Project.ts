export interface Project {
  color: string;
  id: string;
  name: string;
  description?: string;
  themeColor: string;
  ownerId: string;
  isPublic: boolean;
  deletedAt: Date | null;
  forms?: any[]; 
}

export interface ProjectCreate {
  name: string;
  description?: string;
  themeColor: string;
}