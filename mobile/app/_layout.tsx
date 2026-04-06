import { useEffect } from 'react';
import { useRouter, useSegments, Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

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

  const { isAuthenticated } = useAuthStore();
  const { syncPendingActions } = useSync();
  const segments = useSegments();
  const router = useRouter();

  // 2. Inicialização do Banco e Sync
  useEffect(() => {
    initDatabase();
    if (isAuthenticated) {
      syncPendingActions();
    }
  }, [isAuthenticated]);

  // 3. Proteção de Rotas (Auth Guard)
  useEffect(() => {
    if (!fontsLoaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(drawer)');
    }
    
    SplashScreen.hideAsync();
  }, [isAuthenticated, segments, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider style={{ backgroundColor: THEME.colors.background }}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ 
        headerShown: false,
        contentStyle: { backgroundColor: THEME.colors.background } 
      }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
        <Stack.Screen name="(form)" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </SafeAreaProvider>
  );
}