import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Drawer } from 'expo-router/drawer';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import SmartAlert from '@/components/common/SmartAlert';
import { THEME } from '@/styles/theme';
import Logo from '@/components/common/Logo';


function CustomDrawerContent(props: any) {

  const { alertConfig, showAlert, hideAlert } = useAlert(); 
  const router = useRouter();
  const { user, logout } = useAuthStore(); 

  const handleLogoutPress = () => {
    showAlert(
      "Sair da Conta", 
      "Deseja realmente encerrar sua sessão no SmartPanel?", 
      () => logout(),
      'confirm'
    );
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1 }}>
      <SmartAlert {...alertConfig} onCancel={hideAlert} />

      <View style={styles.userHeader}>
        <View style={styles.logoContainer}>
          <Logo size={32} /> 
        </View>
        <Text style={styles.userName}>{user?.name || 'Usuário'}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
      </View>

      <View style={{ flex: 1, marginTop: 10 }}>
        <DrawerItem
          label="Painel Principal"
          focused={props.state.routeNames[props.state.index] === '(tabs)'}
          labelStyle={{ fontFamily: 'Manrope-SemiBold' }}
          activeTintColor={THEME.colors.primary}
          icon={({ color }) => <Ionicons name="grid-outline" size={22} color={color} />}
          onPress={() => router.push('/(drawer)/(tabs)')}
        />
      </View>

      <View style={styles.footer}>
        <DrawerItem
          label="Sair da Conta"
          labelStyle={styles.logoutLabel}
          icon={() => <Ionicons name="log-out-outline" size={22} color="#FF4444" />}
          onPress={handleLogoutPress}
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
            <Logo size={28} />
          </View>
        ), 
        headerTitleAlign: 'center',
        headerShadowVisible: false,
        headerStyle: { backgroundColor: THEME.colors.background },
        drawerStyle: {
          backgroundColor: THEME.colors.background, // Cor pérola do seu THEME
          width: 300,
        },
        drawerActiveTintColor: THEME.colors.primary,
      }}
    >
      <Drawer.Screen name="(tabs)" options={{ drawerLabel: 'Painel Principal' }} />
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
  logoContainer: { marginBottom: 15 },
  userName: { 
    color: THEME.colors.textPrimary, 
    fontFamily: 'Jakarta-Bold', 
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