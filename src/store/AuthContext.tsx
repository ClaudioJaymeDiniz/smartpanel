import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../services/api';
import { useRouter, useSegments } from 'expo-router';

interface AuthContextData {
  signed: boolean;
  user: object | null;
  loading: boolean;
  signIn: (credentials: object) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);
  const [loading, setLoading] = useState(true);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await SecureStore.getItemAsync('user_token');
      
      if (storageToken) {
        try {
          // Valida o token chamando sua rota /auth/me
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          await SecureStore.deleteItemAsync('user_token');
        }
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  // Proteção de Rotas: Redireciona se não estiver logado
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [user, segments, loading]);

  const signIn = async (credentials: any) => {
  try {
    // Para OAuth2 Password Flow, usamos URLSearchParams
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    formData.append('grant_type', 'password');

    const response = await api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    // O FastAPI por padrão retorna access_token e token_type
    const { access_token } = response.data;

    await SecureStore.setItemAsync('user_token', access_token);
    
    // Após salvar o token, buscamos os dados do usuário logado
    const userResponse = await api.get('/auth/me');
    setUser(userResponse.data);

  } catch (error) {
    console.error("Erro no login:", error);
    throw error; // Repassa o erro para a tela tratar (ex: mostrar alerta)
  }
};

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ signed: !!user, user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);