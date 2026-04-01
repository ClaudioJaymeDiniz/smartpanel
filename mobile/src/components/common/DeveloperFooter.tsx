import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '@/src/styles/theme';

export default function DeveloperFooter() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Desenvolvido por <Text style={styles.author}>Claudio Jayme</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    // Opcional: uma linha sutil acima para separar do conteúdo
    borderTopWidth: 0.5,
    borderTopColor: THEME.colors.border,
  },
  text: {
    fontFamily: 'Manrope-Regular',
    fontSize: 12,
    color: THEME.colors.textSecondary,
    letterSpacing: 0.5,
  },
  author: {
    fontFamily: 'Manrope-SemiBold',
    color: THEME.colors.primary, // Seu nome no Verde Esmeralda
  },
});