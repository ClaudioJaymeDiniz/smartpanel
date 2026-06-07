import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

export default function TabLayout() {
  return (
    <Tabs 
      screenOptions={{ 
        headerShown: false,
        tabBarActiveTintColor: THEME.colors.primary,
        tabBarInactiveTintColor: THEME.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: THEME.colors.surface,
          borderTopColor: THEME.colors.border,
          borderTopWidth: 1,
          height: 68,
          paddingBottom: 10,
          paddingTop: 8,
          elevation: 8,
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 12,
        },
        tabBarLabelStyle: {
          fontFamily: 'Manrope-SemiBold',
          fontSize: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Projetos',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'folder' : 'folder-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search' : 'search-outline'} size={24} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="ajustes" // Deve ser exatamente o nome do seu arquivo ajustes.tsx
        options={{
          title: 'Ajustes',
          // Aqui injetamos a engrenagem perfeita para a barra de baixo
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
        }}
      />

      
    </Tabs>
  );
}