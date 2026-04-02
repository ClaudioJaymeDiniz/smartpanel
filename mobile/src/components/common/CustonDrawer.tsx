import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { THEME } from '@/src/styles/theme';
import Logo from './Logo';

export default function CustomDrawer(props: any) {
  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <DrawerContentScrollView {...props}>
        {/* Cabeçalho do Menu com seu Logo */}
        <View style={styles.header}>
          <Logo size={28} />
          <Text style={styles.version}>v1.0.0</Text>
        </View>

        {/* Lista de links (Início, Perfil, etc) */}
        <DrawerItemList {...props} />
      </DrawerContentScrollView>

      {/* Rodapé do Menu (Opcional: Botão Sair) */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>SmartPanel © 2026</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  version: {
    ...THEME.fonts.body,
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: 5,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
  },
  footerText: {
    ...THEME.fonts.body,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    textAlign: 'center'
  }
});