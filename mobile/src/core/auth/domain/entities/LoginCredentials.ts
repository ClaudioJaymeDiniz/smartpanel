import { User } from '@/core/auth/domain/entities/User';
import { LoginCredentials } from '@/core/auth/domain/entities/AuthCredentials';

interface AuthContextData {
  signed: boolean;
  user: User | null; // Tipado!
  loading: boolean;
  isOffline: boolean;
  signIn: (credentials: LoginCredentials) => Promise<void>; // Tipado!
  signOut: () => Promise<void>;
}