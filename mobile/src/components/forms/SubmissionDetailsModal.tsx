import React from 'react';
import { Modal, ScrollView, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

interface SubmissionDetailsModalProps {
  submission: any | null;
  formFields?: any[];
  onClose: () => void;
  renderFieldValue: (key: string, value: any) => React.ReactNode; // Reaproveita a lógica de renderizar textos/imagens
}

export function SubmissionDetailsModal({
  submission,
  formFields = [],
  onClose,
  renderFieldValue,
}: SubmissionDetailsModalProps) {
  if (!submission) return null;

  const fields = Object.entries(submission.formData || {});

  const getQuestionTitle = (fieldId: string) => {
    const matchedField = formFields.find((f) => {
      const fieldValue = f?.fieldId ?? f?.id ?? f?.key ?? f?.name;
      return fieldValue === fieldId;
    });

    return matchedField?.label || matchedField?.title || matchedField?.question || 'Pergunta';
  };

  return (
    <Modal visible={Boolean(submission)} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        
        <View style={styles.content}>
          {/* Header do Modal */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Detalhes da Resposta</Text>
              <Text style={styles.subtitle}>
                Enviado por: {submission.user?.name || submission.user?.email || 'Coletor'}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={THEME.colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Lista de Respostas com scroll */}
          <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
            {/* Metadados */}
            <View style={styles.metaBox}>
              <Text style={styles.metaText}>
                Data: {new Date(submission.createdAt).toLocaleString('pt-BR')}
              </Text>
              
            </View>

            {/* Perguntas e Respostas de fato */}
            {fields.map(([key, value]) => (
              <View key={key} style={styles.fieldBlock}>
                <Text style={styles.fieldQuestion}>{getQuestionTitle(key)}</Text>
                <View style={styles.fieldValueContainer}>
                  {renderFieldValue(key, value)}
                </View>
              </View>
            ))}

            {fields.length === 0 && (
              <Text style={styles.emptyText}>Nenhum dado registrado nesta resposta.</Text>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.6)' },
  content: {
    backgroundColor: THEME.colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderColor: THEME.colors.border,
  },
  title: { fontSize: 18, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  subtitle: { fontSize: 13, color: THEME.colors.textSecondary, marginTop: 2 },
  closeButton: { padding: 4, backgroundColor: THEME.colors.surface, borderRadius: 20 },
  scrollBody: { padding: 20, gap: 16 },
  metaBox: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    gap: 4,
  },
  metaText: { fontSize: 12, color: THEME.colors.textSecondary, fontFamily: 'Manrope-Regular' },
  fieldBlock: { gap: 6 },
  fieldQuestion: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  fieldValueContainer: {
    backgroundColor: THEME.colors.surface,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  emptyText: { textAlign: 'center', color: THEME.colors.textSecondary, marginTop: 20 },
});