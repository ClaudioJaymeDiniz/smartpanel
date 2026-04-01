import { Drawer } from 'expo-router/drawer';

export default function DrawerLayout() {
  return (
    <Drawer screenOptions={{ headerShown: true }}>
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Início',
          title: 'Meu App',
        }}
      />
      <Drawer.Screen
        name="profile"
        options={{
          drawerLabel: 'Meu Perfil',
          title: 'Perfil',
        }}
      />
    </Drawer>
  );
}