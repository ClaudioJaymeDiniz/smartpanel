export interface User {
  id: string;
  email: string;
  name?: string;
  provider: 'local' | 'google' | 'facebook';
  globalMetadata?: any;
  createdAt: Date;
}

export interface AuthSession {
  accessToken: string;
  tokenType: string;
  user: User;
}