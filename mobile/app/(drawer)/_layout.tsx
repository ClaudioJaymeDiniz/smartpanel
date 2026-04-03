import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Alert, StyleSheet } from 'react-native';
import { useAuth } from '@/src/store/AuthContext';
import { THEME } from '@/src/styles/theme';
import Logo from '@/src/components/common/Logo';
import {useRouter} from 'expo-router';

function CustomDrawerContent(props: any) {
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja realmente encerrar sua sessão?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => signOut() }
    ]);
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <View style={styles.userHeader}>
        <View style={styles.logoContainer}>
          <Logo size={32} /> 
        </View>
        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={{ flex: 1, marginTop: 10 }}>
        {/* ITEM MANUAL PARA FORÇAR A HOME */}
        <DrawerItem
          label="Painel Principal"
          focused={props.state.index === 0} // Mantém o destaque visual
          labelStyle={{ fontFamily: 'Manrope-SemiBold' }}
          activeTintColor={THEME.colors.primary}
          icon={({ color }) => <Ionicons name="grid-outline" size={22} color={color} />}
          onPress={() => {
            // Isso força o app a ir para a index das tabs, não importa onde você esteja
            router.push('/(drawer)/(tabs)');
          }}
        />
        
        {/* Se você tiver outros itens no futuro, adicione aqui como DrawerItem */}
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label="Sair da Conta"
          labelStyle={styles.logoutLabel}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#FF4444" />}
          onPress={handleLogout}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  return (
    <Drawer 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{ 
        headerShown: true,
        headerTitle: () => (
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            <Logo size={30} />
          </View>
        ), 
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: THEME.colors.background },
        drawerStyle: {
          backgroundColor: '#FDF0E3', 
          width: 300,
        },
        drawerActiveTintColor: THEME.colors.primary,
        drawerLabelStyle: { fontFamily: 'Manrope-SemiBold' },
      }}
    >
      {/* Mantenha a Screen, mas sem lógicas complexas nas options */}
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Painel Principal',
          drawerIcon: ({ color }) => <Ionicons name="grid-outline" size={22} color={color} />,
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  userHeader: {
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 15,
  },
  userName: { 
    color: THEME.colors.textPrimary, 
    fontFamily: 'Manrope-Bold', 
    fontSize: 18,
    textAlign: 'center' 
  },
  userEmail: { 
    color: THEME.colors.textSecondary, 
    fontSize: 13, 
    fontFamily: 'Manrope-Regular',
    textAlign: 'center' 
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    paddingBottom: 20,
    paddingTop: 10
  },
  logoutLabel: { color: '#FF4444', fontFamily: 'Manrope-SemiBold' }
});