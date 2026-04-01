import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/src/styles/theme';

interface LogoProps {
  size?: number;
}

export default function Logo({ size = 32 }: LogoProps) {
  return (
    <View style={styles.container}>
      <Text style={[styles.smart, { fontSize: size }]}>Smart</Text>
      <Text style={[styles.panel, { fontSize: size }]}>Panel</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'baseline' },
  smart: { fontFamily: 'Jakarta-Medium', color: THEME.colors.textSecondary },
  panel: { fontFamily: 'Jakarta-Bold', color: THEME.colors.primary },
});