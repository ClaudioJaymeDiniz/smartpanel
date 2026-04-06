import { useState } from 'react';
import { Alert } from 'react-native';
// Importação corrigida para a pasta DATA
import { AuthRepositoryImpl } from '@/data/auth/repositories/AuthRepositoryImpl';
import { useAuthStore } from '../store/useAuthStore';

export function useLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Agora o TS sabe o que é 'state' porque tipamos o useAuthStore
  const setUser = useAuthStore((state) => state.setUser);
  const repository = new AuthRepositoryImpl();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      // O repository agora recebe LoginCredentials e retorna AuthSession corretamente
      const session = await repository.login({ email, password });
      setUser(session.user); 
    } catch (error: any) {
      console.error(error);
      Alert.alert("Falha no Login", "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return { email, setEmail, password, setPassword, loading, handleLogin };
}