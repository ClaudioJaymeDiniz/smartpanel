import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

interface Props {
  owner: any;
  members: any[];
  projectColor: string;
  onInvitePress?: () => void; // Tornou-se opcional
  isOwner: boolean; // Nova Prop
}

export const ProjectTeamList = ({ owner, members, projectColor, onInvitePress, isOwner }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Equipe</Text>
        
        {/* SÓ MOSTRA CONVIDAR SE FOR DONO */}
        {isOwner && (
          <TouchableOpacity onPress={onInvitePress}>
            <Text style={{ color: projectColor, fontFamily: 'Manrope-Bold' }}>Convidar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dono: Sempre visível para todos */}
      <View style={styles.memberCard}>
        <View style={[styles.avatar, { backgroundColor: projectColor + '20' }]}>
          <Text style={{ color: projectColor, fontWeight: 'bold' }}>{owner?.name?.[0]?.toUpperCase()}</Text>
        </View>
        <View>
          <Text style={styles.name}>{owner?.name}</Text>
          <Text style={styles.role}>Dono do Projeto</Text>
        </View>
      </View>

      {/* Outros Membros: Só visíveis para o Dono */}
      {isOwner && members?.map((item) => (
        <View key={item.userId} style={[styles.memberCard, { marginTop: 12 }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.user?.name?.[0]?.toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.name}>{item.user?.name}</Text>
            <Text style={styles.role}>{item.role === 'member' ? 'Colaborador' : item.role}</Text>
          </View>
        </View>
      ))}

      {/* Feedback visual para colaborador */}
      {!isOwner && members?.length > 0 && (
        <Text style={styles.infoText}>+ {members.length} colaboradores participando</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginTop: 30, borderTopWidth: 1, borderTopColor: THEME.colors.border, paddingTop: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  title: { ...THEME.fonts.title, fontSize: 18 },
  memberCard: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: THEME.colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: THEME.colors.textSecondary, fontWeight: 'bold' },
  name: { fontFamily: 'Manrope-Bold', fontSize: 14 },
  role: { fontSize: 12, color: THEME.colors.textSecondary },
  infoText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 10,
    marginLeft: 52
  },
});