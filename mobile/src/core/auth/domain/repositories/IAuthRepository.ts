// src/core/auth/domain/repositories/IAuthRepository.ts
import { User, AuthSession } from '../entities/User';
import { LoginCredentials, RegisterData } from '../entities/AuthCredentials';

export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<AuthSession>;
  register(data: RegisterData): Promise<User>;
  recoverPassword(email: string): Promise<void>;
  getMe(): Promise<User>;
}