import { Drawer } from 'expo-router/drawer';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/src/styles/theme';
import Logo from '@/src/components/common/Logo'; // Importando seu componente

export default function DrawerLayout() {
  return (
    <Drawer 
      screenOptions={{ 
        headerShown: true,
        // Substituímos o título de texto pelo seu componente Logo
        headerTitle: () => <Logo size={20} />, 
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: THEME.colors.background },
        drawerActiveTintColor: THEME.colors.primary,
        drawerLabelStyle: { fontFamily: 'Manrope-SemiBold' },
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Painel Principal',
          drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
      {/* Outras telas... */}
    </Drawer>
  );
}