import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SQLite from 'expo-sqlite';
import NetInfo from '@react-native-community/netinfo';
import { useRouter, useSegments } from 'expo-router';
import { api } from '../services/api';

interface AuthContextData {
  signed: boolean;
  user: any;
  loading: boolean;
  isOffline: boolean;
  signIn: (credentials: any) => Promise<void>;
  signOut: () => Promise<void>; // Ajustado para Promise
  syncOfflineData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const db = SQLite.openDatabaseSync('smartpanel.db');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  // 1. Inicializa Banco e Monitora Rede
  useEffect(() => {
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

    const unsubscribe = NetInfo.addEventListener(state => {
      const offline = !state.isConnected;
      setIsOffline(offline);
    });

    return () => unsubscribe();
  }, []);

  // 2. Tenta sincronizar quando a rede volta e o user está logado
  useEffect(() => {
    if (!isOffline && user) {
      syncOfflineData();
    }
  }, [isOffline, user]);

  // 3. Carrega Dados Iniciais
  useEffect(() => {
    async function loadStorageData() {
      try {
        const storageToken = await SecureStore.getItemAsync('user_token');
        if (storageToken) {
          const response = await api.get('/auth/me');
          setUser(response.data);
        }
      } catch (error) {
        const state = await NetInfo.fetch();
        if (state.isConnected) {
          await SecureStore.deleteItemAsync('user_token');
        }
      } finally {
        setLoading(false);
      }
    }
    loadStorageData();
  }, []);

  // 4. Proteção de Rotas
  useEffect(() => {
    if (loading) return;
    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(drawer)/(tabs)');
    }
  }, [user, segments, loading]);

  const syncOfflineData = async () => {
    try {
      const queue: any[] = db.getAllSync('SELECT * FROM sync_queue');
      if (queue.length === 0) return;

      console.log(`[SmartPanel] Sincronizando ${queue.length} itens...`);
      for (const item of queue) {
        await api.post(item.endpoint, JSON.parse(item.payload));
        db.runSync('DELETE FROM sync_queue WHERE id = ?', [item.id]);
      }
    } catch (err) {
      console.error("Erro ao sincronizar:", err);
    }
  };

  const signIn = async (credentials: any) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', credentials.email);
      formData.append('password', credentials.password);

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
    try {
      await SecureStore.deleteItemAsync('user_token');
      setUser(null);
      // O useEffect de Proteção de Rotas cuidará do redirecionamento
    } catch (error) {
      console.error("Erro ao deslogar:", error);
    }
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