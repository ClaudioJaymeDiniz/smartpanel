import { Stack } from 'expo-router';
import { THEME } from '@/src/styles/theme';

export default function FormLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: THEME.colors.background },
        headerShadowVisible: false,
        headerTitleStyle: { fontFamily: 'Jakarta-Bold' },
        headerTintColor: THEME.colors.primary,
      }}
    >
      <Stack.Screen name="new" options={{ title: 'Novo Formulário' }} />
      <Stack.Screen name="[id]" options={{ title: 'Coleta de Dados' }} />
    </Stack>
  );
}