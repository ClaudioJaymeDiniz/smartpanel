import { api } from '@/services/api';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import axios from 'axios';
import { IAuthRepository } from '@/core/auth/domain/repositories/IAuthRepository';
import { LoginCredentials, RegisterData } from '@/core/auth/domain/entities/AuthCredentials';
import { AuthSession, User } from '@/core/auth/domain/entities/User';
import { UserMapper } from '@/core/auth/mappers/UserMapper';

const USER_CACHE_KEY = 'auth_user_cache';
const LOGIN_CACHE_KEY = 'auth_login_cache';

type CachedLogin = {
  email: string;
  passwordHash: string;
};

function serializeUser(user: User) {
  return JSON.stringify({
    ...user,
    createdAt: user.createdAt instanceof Date ? user.createdAt.toISOString() : user.createdAt,
  });
}

function parseCachedUser(raw: string | null): User | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return {
      ...parsed,
      createdAt: parsed.createdAt ? new Date(parsed.createdAt) : new Date(),
    } as User;
  } catch {
    return null;
  }
}

export class AuthRepositoryImpl implements IAuthRepository {

  private async cacheUser(user: User) {
    await SecureStore.setItemAsync(USER_CACHE_KEY, serializeUser(user));
  }

  private async cacheLogin(email: string, password: string) {
    const passwordHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password
    );

    const cache: CachedLogin = {
      email: email.trim().toLowerCase(),
      passwordHash,
    };

    await SecureStore.setItemAsync(LOGIN_CACHE_KEY, JSON.stringify(cache));
  }

  private async tryOfflineLogin(credentials: LoginCredentials): Promise<AuthSession> {
    const [cachedLoginRaw, cachedUserRaw] = await Promise.all([
      SecureStore.getItemAsync(LOGIN_CACHE_KEY),
      SecureStore.getItemAsync(USER_CACHE_KEY),
    ]);

    if (!cachedLoginRaw || !cachedUserRaw) {
      throw new Error('Sem credenciais locais para login offline.');
    }

    const cachedLogin = JSON.parse(cachedLoginRaw) as CachedLogin;
    const cachedUser = parseCachedUser(cachedUserRaw);
    if (!cachedUser) {
      throw new Error('Usuario em cache invalido.');
    }

    const incomingEmail = credentials.email.trim().toLowerCase();
    const incomingHash = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      credentials.password || ''
    );

    if (cachedLogin.email !== incomingEmail || cachedLogin.passwordHash !== incomingHash) {
      throw new Error('Credenciais invalidas para login offline.');
    }

    return {
      accessToken: 'offline-session',
      tokenType: 'offline',
      user: cachedUser,
    };
  }
  
  async login(credentials: LoginCredentials): Promise<AuthSession> {
    try {
      const params = new URLSearchParams();
      params.append('username', credentials.email);
      params.append('password', credentials.password || '');

      const response = await api.post('/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const { access_token, token_type } = response.data;
      await SecureStore.setItemAsync('user_token', access_token);
      
      const user = await this.getMe();
      await Promise.all([
        this.cacheUser(user),
        this.cacheLogin(credentials.email, credentials.password || ''),
      ]);

      return { 
        accessToken: access_token, 
        tokenType: token_type || 'bearer', 
        user 
      };
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        return this.tryOfflineLogin(credentials);
      }
      throw error;
    }
  }

  async getMe(): Promise<User> {
    try {
      const response = await api.get('/auth/me');
      const user = UserMapper.toDomain(response.data);
      await this.cacheUser(user);
      return user;
    } catch (error) {
      if (axios.isAxiosError(error) && !error.response) {
        const cached = await SecureStore.getItemAsync(USER_CACHE_KEY);
        const cachedUser = parseCachedUser(cached);
        if (cachedUser) return cachedUser;
      }
      throw error;
    }
  }

  async register(data: RegisterData): Promise<User> {
    const response = await api.post('/auth/register', data);
    return UserMapper.toDomain(response.data);
  }

  async recoverPassword(email: string): Promise<void> {
    await api.post('/auth/recover-password', { email });
  }

  async loginWithGoogle(idToken: string): Promise<AuthSession> {
    const response = await api.post('/auth/google-login', { id_token: idToken });
    
    const { access_token, token_type } = response.data;
    await SecureStore.setItemAsync('user_token', access_token);
    
    const user = await this.getMe();
    await this.cacheUser(user);

    return { 
      accessToken: access_token, 
      tokenType: token_type || 'bearer', 
      user 
    };
  }
}