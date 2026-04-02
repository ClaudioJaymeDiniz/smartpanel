import { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
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

import { AuthProvider } from '@/src/store/AuthContext';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Jakarta-Bold': PlusJakartaSans_700Bold,
    'Jakarta-Medium': PlusJakartaSans_500Medium,
    'Jakarta-Regular': PlusJakartaSans_400Regular,
    'Manrope-Regular': Manrope_400Regular,
    'Manrope-SemiBold': Manrope_600SemiBold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <AuthProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* Aqui o Stack vai decidir se mostra o (auth) ou o (drawer) */}
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(drawer)" />
      </Stack>
    </AuthProvider>
  );
}