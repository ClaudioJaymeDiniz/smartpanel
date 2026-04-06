export interface LoginCredentials {
  email: string;
  password?: string; // Opcional se for OAuth2 puro, mas obrigatório para o seu backend
}

export interface RegisterData {
  email: string;
  password?: string;
  name?: string;
}

export interface PasswordResetData {
  token: string;
  newPassword?: string;
}