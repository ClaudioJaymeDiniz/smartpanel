import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import { useRouter, useSegments } from 'expo-router';
import { api } from '../services/api';

interface AuthContextData {
  signed: boolean;
  user: any;
  loading: boolean;
  isOffline: boolean; // Novo: Indica se o app está sem rede
  signIn: (credentials: any) => Promise<void>;
  signOut: () => void;
  syncOfflineData: () => Promise<void>; // Novo: Função para disparar o sync manualmente
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// Abre o banco local SmartPanel
const db = SQLite.openDatabaseSync('smartpanel.db');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  // 1. Inicializa Banco de Dados e Monitora Rede
  useEffect(() => {
    // Cria tabelas para Cache e Fila de Sincronismo
    db.execSync(`
      CREATE TABLE IF NOT EXISTS projects_cache (
        id TEXT PRIMARY KEY,
        name TEXT,
        data TEXT
      );
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        endpoint TEXT,
        payload TEXT,
        method TEXT DEFAULT 'POST',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Monitor de Conexão
    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
      
      // Se a internet voltou e temos um usuário, tenta sincronizar
      if (!offline && user) {
        syncOfflineData();
      }
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Carrega Dados Iniciais (Token)
  useEffect(() => {
    async function loadStorageData() {
      const storageToken = await SecureStore.getItemAsync('user_token');
      
      if (storageToken) {
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
        } catch (error) {
          // Se estiver offline, não deletamos o token, apenas mantemos o que temos
          const state = await NetInfo.fetch();
          if (state.isConnected) {
            await SecureStore.deleteItemAsync('user_token');
          }
        }
      }
      setLoading(false);
    }
    loadStorageData();
  }, []);

  // 3. Proteção de Rotas
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [user, segments, loading]);

  // 4. Lógica de Sincronismo
  const syncOfflineData = async () => {
    const queue: any[] = db.getAllSync('SELECT * FROM sync_queue');
    
    if (queue.length === 0) return;

    console.log(`[SmartPanel] Sincronizando ${queue.length} itens...`);

    for (const item of queue) {
      try {
        await api.post(item.endpoint, JSON.parse(item.payload));
        db.runSync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
      } catch (err) {
        console.error("Erro ao sincronizar item:", err);
      }
    }
  };

  const signIn = async (credentials: any) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);
      formData.append('grant_type', 'password');

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token } = response.data;
      await SecureStore.setItemAsync('user_token', access_token);
      
      const userResponse = await api.get('/auth/me');
      setUser(userResponse.data);
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync('user_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      signed: !!user, 
      user, 
      loading, 
      isOffline, 
      signIn, 
      signOut, 
      syncOfflineData 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);