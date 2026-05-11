import { useEffect, useState } from 'react';
import { useRouter, useSegments, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import * as NetInfo from '@react-native-community/netinfo';

// Fontes
import { 
  useFonts, 
  PlusJakartaSans_700Bold, 
  PlusJakartaSans_500Medium, 
  PlusJakartaSans_400Regular 
} from '@expo-google-fonts/plus-jakarta-sans';
import { 
  Manrope_400Regular, 
  Manrope_600SemiBold 
} from '@expo-google-fonts/manrope';

// Camada de Dados e Estilo
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { initDatabase } from '@/services/sqlite';
import { useSync } from '@/presentation/shared/hooks/useSync';
import { THEME } from '@/styles/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  // 1. Carregamento de Fontes
  const [fontsLoaded, fontError] = useFonts({
    'Jakarta-Bold': PlusJakartaSans_700Bold,
    'Jakarta-Medium': PlusJakartaSans_500Medium,
    'Jakarta-Regular': PlusJakartaSans_400Regular,
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-SemiBold': Manrope_600SemiBold,
  });

  const { isAuthenticated, setUser } = useAuthStore();
  const { syncPendingActions, clearLegacySyncQueue } = useSync();
  const segments = useSegments();
  const router = useRouter();
  const [authHydrated, setAuthHydrated] = useState(false);

  // 0. Hidrata sessao local para permitir entrar no app offline.
  useEffect(() => {
    let mounted = true;

    const hydrateAuth = async () => {
      try {
        const [token, cachedUserRaw] = await Promise.all([
          SecureStore.getItemAsync('user_token'),
          SecureStore.getItemAsync('auth_user_cache'),
        ]);

        if (token && cachedUserRaw) {
          const cachedUser = JSON.parse(cachedUserRaw);
          setUser({
            ...cachedUser,
            createdAt: cachedUser.createdAt ? new Date(cachedUser.createdAt) : new Date(),
          });
        }
      } catch (error) {
        console.warn('Falha ao restaurar sessao local:', error);
      } finally {
        if (mounted) setAuthHydrated(true);
      }
    };

    hydrateAuth();

    return () => {
      mounted = false;
    };
  }, [setUser]);

  // 2. Inicialização do Banco e Sync
  useEffect(() => {
    initDatabase();
    if (isAuthenticated) {
      clearLegacySyncQueue();
      syncPendingActions();
    }
  }, [isAuthenticated, syncPendingActions, clearLegacySyncQueue]);

  // 2.1 Sincroniza novamente quando a conexao volta.
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && isAuthenticated) {
        syncPendingActions();
      }
    });

    return () => unsubscribe();
  }, [isAuthenticated, syncPendingActions]);

  // 3. Proteção de Rotas (Auth Guard)
  useEffect(() => {
    if (!fontsLoaded || !authHydrated) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(drawer)');
    }
    
    SplashScreen.hideAsync();
  }, [isAuthenticated, segments, fontsLoaded, authHydrated, router]);

  if ((!fontsLoaded || !authHydrated) && !fontError) return null;

  return (
    <SafeAreaProvider style={{ backgroundColor: THEME.colors.background }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: THEME.colors.background } 
      }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}