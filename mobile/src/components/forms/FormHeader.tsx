import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

interface FormHeaderProps {
  title?: string;
  description?: string;
  totalCount: number;
  visibleCount: number;
  isOwner: boolean;
  isFormArchived: boolean;
  accentColor: string;
  accentSoft: string;
  accentBorder: string;
  onBack?: () => void;
}

export function FormHeader({
  title,
  description,
  totalCount,
  visibleCount,
  isOwner,
  isFormArchived,
  accentColor,
  accentSoft,
  accentBorder,
  onBack,
}: FormHeaderProps) {
  return (
    <View>
      {onBack && (
        <TouchableOpacity style={[styles.backButton, { backgroundColor: `${accentColor}12` }]} onPress={onBack}>
          <Ionicons name="arrow-back" size={22} color={accentColor} />
        </TouchableOpacity>
      )}

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description || 'Visualize as respostas enviadas.'}</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{totalCount}</Text>
          <Text style={styles.summaryLabel}>Total de respostas</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryValue}>{visibleCount}</Text>
          <Text style={styles.summaryLabel}>Visíveis para você</Text>
        </View>
      </View>

      {!isOwner && (
        <View style={[styles.banner, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
          <Ionicons name="lock-closed-outline" size={18} color={accentColor} />
          <Text style={[styles.bannerText, { color: accentColor }]}>
            Você vê apenas suas respostas. O total do formulário continua disponível acima.
          </Text>
        </View>
      )}

      {isOwner && isFormArchived && (
        <View style={[styles.banner, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
          <Ionicons name="archive-outline" size={18} color="#64748B" />
          <Text style={[styles.bannerText, { color: '#475569' }]}>Formulário arquivado</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backButton: { alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 18, marginBottom: 12 },
  title: { fontSize: 24, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  description: { marginTop: 6, marginBottom: 18, color: THEME.colors.textSecondary, fontSize: 14 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  summaryCard: { flex: 1, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: THEME.colors.border, backgroundColor: THEME.colors.surface },
  summaryValue: { fontFamily: 'Jakarta-Bold', fontSize: 22, color: THEME.colors.textPrimary },
  summaryLabel: { marginTop: 2, fontFamily: 'Manrope-Regular', fontSize: 12, color: THEME.colors.textSecondary },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 14 },
  bannerText: { flex: 1, fontFamily: 'Manrope-SemiBold', fontSize: 12 },
});