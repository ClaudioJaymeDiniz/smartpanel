export interface Project {
  color: string;
  id: string;
  name: string;
  description?: string;
  themeColor: string;
  ownerId: string;
  owner?: {
    id: string;
    name?: string | null;
    email?: string;
  } | null;
  members?: Array<{
    userId: string;
    role: string;
    user: {
      id: string;
      name?: string | null;
      email?: string;
    };
  }>;
  isPublic: boolean;
  deletedAt: Date | null;
  forms?: any[]; 
}

export interface ProjectCreate {
  name: string;
  description?: string;
  themeColor: string;
}