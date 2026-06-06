import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

interface FormActionsProps {
  isOwner: boolean;
  isFormArchived: boolean;
  isProjectArchived: boolean;
  accentColor: string;
  accentSoft: string;
  accentBorder: string;
  onEditForm: () => void;
  onAnalytics: () => void;
  onExportCsv: () => void;
  onArchiveForm: () => void;
  onRestoreForm: () => void;
  onPermanentDelete: () => void;
  onAnswerScreen: () => void;
}

export function FormActions({
  isOwner,
  isFormArchived,
  isProjectArchived,
  accentColor,
  accentSoft,
  accentBorder,
  onEditForm,
  onAnalytics,
  onExportCsv,
  onArchiveForm,
  onRestoreForm,
  onPermanentDelete,
  onAnswerScreen,
}: FormActionsProps) {
  if (!isOwner) {
    const isDisabled = isProjectArchived || isFormArchived;
    return (
      <TouchableOpacity style={[styles.primaryButton, isDisabled && styles.disabledButton]} onPress={onAnswerScreen} disabled={isDisabled}>
        <Ionicons name="paper-plane-outline" size={16} color="#FFF" />
        <Text style={styles.primaryButtonText}>
          {isFormArchived ? 'Formulário arquivado' : isProjectArchived ? 'Projeto arquivado' : 'Responder formulário'}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.ownerActions}>
      {!isFormArchived ? (
        <>
          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={onEditForm}>
            <Ionicons name="build-outline" size={16} color={accentColor} />
            <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Editar formulário</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={onAnalytics}>
            <Ionicons name="analytics-outline" size={16} color={accentColor} />
            <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Analytics</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={onExportCsv}>
            <Ionicons name="download-outline" size={16} color={accentColor} />
            <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Baixar CSV</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={onArchiveForm}>
            <Ionicons name="archive-outline" size={16} color={accentColor} />
            <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Arquivar formulário</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={onRestoreForm}>
            <Ionicons name="arrow-undo-outline" size={16} color={accentColor} />
            <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Restaurar formulário</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerButton} onPress={onPermanentDelete}>
            <Ionicons name="trash-outline" size={16} color="#EF4444" />
            <Text style={styles.dangerButtonText}>Excluir definitivamente</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  ownerActions: { gap: 10 },
  primaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: THEME.colors.primary, height: 48, borderRadius: 14 },
  primaryButtonText: { color: '#FFF', fontFamily: 'Jakarta-Bold', fontSize: 14 },
  disabledButton: { opacity: 0.6 },
  secondaryButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, height: 48, borderRadius: 14 },
  secondaryButtonText: { fontFamily: 'Jakarta-Bold', fontSize: 14 },
  dangerButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1, height: 48, borderRadius: 14 },
  dangerButtonText: { color: '#DC2626', fontFamily: 'Jakarta-Bold', fontSize: 14 },
});