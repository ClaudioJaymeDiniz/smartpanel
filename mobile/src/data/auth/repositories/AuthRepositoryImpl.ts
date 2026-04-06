import { api } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import { IAuthRepository } from '@/core/auth/domain/repositories/IAuthRepository';
import { LoginCredentials, RegisterData } from '@/core/auth/domain/entities/AuthCredentials';
import { AuthSession, User } from '@/core/auth/domain/entities/User';
import { UserMapper } from '@/core/auth/mappers/UserMapper';

export class AuthRepositoryImpl implements IAuthRepository {
  
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    const params = new URLSearchParams();
    params.append('username', credentials.email);
    params.append('password', credentials.password || '');

    const response = await api.post('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const { access_token, token_type } = response.data;
    await SecureStore.setItemAsync('user_token', access_token);
    
    const user = await this.getMe();

    return { 
      accessToken: access_token, 
      tokenType: token_type || 'bearer', 
      user 
    };
  }

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return UserMapper.toDomain(response.data);
  }

  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/auth/register', data);
    return UserMapper.toDomain(response.data);
  }

  async recoverPassword(email: string): Promise<void> {
    await api.post('/auth/recover-password', { email });
  }
}