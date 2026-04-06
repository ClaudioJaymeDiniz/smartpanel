import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

interface Props {
  forms: any[];
  projectColor: string;
  projectId: string;
  onFormPress: (id: string) => void;
  onNewFormPress?: () => void; 
  isOwner: boolean;
}

export const ProjectFormList = ({ forms, projectColor, onFormPress, onNewFormPress, isOwner }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.headerContent}>
        <View style={styles.titleRow}>
          <View>
            <Text style={styles.sectionTitle}>Formulários</Text>
            <Text style={styles.sectionSubtitle}>Coleta de dados ativa</Text>
          </View>
          
          {/* SÓ MOSTRA O BOTÃO SE FOR DONO */}
          {isOwner && (
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: projectColor }]}
              onPress={onNewFormPress}
            >
              <Ionicons name="add" size={26} color="#FFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {forms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="clipboard-outline" size={48} color={THEME.colors.border} />
          <Text style={styles.emptyText}>Nenhum formulário criado.</Text>
        </View>
      ) : (
        forms.map((item) => (
          <TouchableOpacity 
            key={item.id}
            style={styles.formCard}
            onPress={() => onFormPress(item.id)}
          >
            <View style={[styles.iconBox, { backgroundColor: projectColor + '15' }]}>
              <Ionicons name="document-text" size={22} color={projectColor} />
            </View>
            <View style={styles.formInfo}>
              <Text style={styles.formTitle}>{item.title}</Text>
            <Text style={styles.formMeta}>{item.submissionCount || 0} respostas enviadas</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={THEME.colors.border} />
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 20 },
  headerContent: { marginBottom: 20 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...THEME.fonts.title, fontSize: 22 },
  sectionSubtitle: { ...THEME.fonts.subtitle, fontSize: 13, color: THEME.colors.textSecondary },
  addButton: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  formCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    padding: 16,
    borderRadius: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  iconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 15 },
  formInfo: { flex: 1 },
  formTitle: { ...THEME.fonts.body, fontFamily: 'Jakarta-Bold', fontSize: 15 },
  formMeta: { fontSize: 12, color: THEME.colors.textSecondary, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: THEME.colors.textSecondary, marginTop: 10 }
});