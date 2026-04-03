

export interface User {
  id: string;
  email: string;
  name?: string;
  provider: 'local' | 'google' | 'facebook';
  globalMetadata?: any;
  createdAt: string;
  // No Front, as relações costumam vir como IDs ou objetos aninhados
  ownedProjects?: any[]; 
  projects?: any[];
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}