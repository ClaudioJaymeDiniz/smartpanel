import { Stack, useLocalSearchParams } from 'expo-router';
import { COLORS } from '@/styles/colors';

export default function ProjectLayout() {
  const { id, name } = useLocalSearchParams();

  return (
    <Stack
      screenOptions={{
        headerStyle: { 
          backgroundColor: COLORS.background // Ou a themeColor do projeto vinda do banco
        },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontFamily: 'Jakarta-Bold' },
        headerBackTitle: 'Voltar',
      }}
    >
      {/* Tela principal do projeto que lista os formulários */}
      <Stack.Screen 
        name="[id]" 
        options={{ title: name ? String(name) : 'Projeto' }} 
      />
      
      <Stack.Screen 
        name="edit" 
        options={{ title: 'Configurações' }} 
      />
    </Stack>
  );
}