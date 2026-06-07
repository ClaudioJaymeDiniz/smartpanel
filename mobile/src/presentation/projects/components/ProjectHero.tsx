import React from 'react';
import { View, Text as RNText, StyleSheet } from 'react-native';
import { THEME } from '@/styles/theme';

interface ProjectHeroProps {
  name: string;
  description?: string;
  formsCount: number;
  membersCount: number;
}

export function ProjectHero({ name, description, formsCount, membersCount }: ProjectHeroProps) {
  return (
    <View style={styles.heroCard}>
      <RNText style={styles.projectTitle}>{name}</RNText>
      <RNText style={styles.projectDescription} numberOfLines={3}>
        {description || 'Organize formulários, convites e respostas em um único espaço de trabalho.'}
      </RNText>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <RNText style={styles.summaryValue}>{formsCount}</RNText>
          <RNText style={styles.summaryLabel}>Formulários</RNText>
        </View>
        <View style={styles.summaryCard}>
          <RNText style={styles.summaryValue}>{membersCount}</RNText>
          <RNText style={styles.summaryLabel}>Membros</RNText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginTop: 6,
    marginBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  projectTitle: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 24,
    color: THEME.colors.textPrimary,
  },
  projectDescription: {
    marginTop: 8,
    color: THEME.colors.textSecondary,
    fontFamily: 'Manrope-Regular',
    lineHeight: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: THEME.colors.inputBg,
  },
  summaryValue: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 22,
    color: THEME.colors.textPrimary,
  },
  summaryLabel: {
    marginTop: 2,
    fontFamily: 'Manrope-Regular',
    color: THEME.colors.textSecondary,
    fontSize: 12,
  },
});