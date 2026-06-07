import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Container from '@/components/common/Container';
import SmartAlert from '@/components/common/SmartAlert';
import { THEME } from '@/styles/theme';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { api } from '@/services/api';

interface Invitation {
  id: string;
  role: string;
  project: {
    name: string;
  };
}

export default function Profile() {
  const { alertConfig, showAlert, hideAlert } = useAlert();
  const { user, logout } = useAuthStore();
  
  // Estados de controle
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);
  
  // Estados de Edição de Usuário
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Buscar convites enviados para o e-mail do usuário logado
  const loadMyPendingInvitations = async () => {
    setLoadingInvites(true);
    try {
      const response = await api.get('/invitations/pending');
      setInvitations(response.data);
    } catch (error) {
      console.error('Erro ao buscar convites recebidos:', error);
    } finally {
      setLoadingInvites(false);
    }
  };

  useEffect(() => {
    loadMyPendingInvitations();
  }, []);

  // Aceitar convite
  const handleAcceptInvite = async (id: string, projectName: string) => {
    showAlert('Aceitar Convite', `Deseja entrar para o projeto "${projectName}"?`, async () => {
      try {
        await api.post(`/invitations/${id}/accept`);
        showAlert('Sucesso', 'Você agora faz parte do projeto!');
        loadMyPendingInvitations();
      } catch (error) {
        showAlert('Erro', 'Não foi possível aceitar o convite no momento.');
      }
    }, 'confirm');
  };

  // Recusar convite recebido
  const handleRejectInvite = async (id: string, projectName: string) => {
    showAlert('Recusar Convite', `Deseja recusar o convite para "${projectName}"?`, async () => {
      try {
        await api.delete(`/invitations/${id}`);
        showAlert('Convite Recusado', 'O convite foi removido.');
        loadMyPendingInvitations();
      } catch (error) {
        showAlert('Erro', 'Não foi possível rejeitar o convite.');
      }
    }, 'confirm');
  };

  // Salvar alteração do nome no Backend
  const handleSaveProfile = async () => {
    if (!name.trim() || name.trim() === user?.name) {
      setIsEditing(false);
      return;
    }
    
    setIsSavingUser(true);
    try {
      // Chamando a sua rota PATCH /users/me
      const response = await api.patch('/users/me', { name: name.trim() });
      
      showAlert('Perfil Atualizado', 'Seu nome foi alterado com sucesso.');
      setIsEditing(false);

      // Atualiza o Zustand com o objeto de usuário modificado que a rota devolve
      if (useAuthStore.getState().setUser) {
        useAuthStore.getState().setUser(response.data);
      }
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      showAlert('Falha ao atualizar', 'Não foi possível salvar os dados.');
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleLogout = () => {
    showAlert('Sair da conta', 'Deseja encerrar sua sessão?', () => logout(), 'confirm');
  };


const displayRole = 'Membro'
  return (
    <View style={styles.mainContainer}>
      <SmartAlert {...alertConfig} onCancel={hideAlert} />

      <ScrollView contentContainerStyle={styles.scroll}>
        <Container>
          
          {/* CARD DE PERFIL / EDIÇÃO */}
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={28} color={THEME.colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Seu nome"
                  autoFocus
                  maxLength={50}
                />
              ) : (
                <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
              )}
              <Text style={styles.email}>{user?.email || 'Sem e-mail cadastrado'}</Text>
            </View>
            
            <TouchableOpacity 
              onPress={isEditing ? handleSaveProfile : () => setIsEditing(true)}
              style={styles.editButton}
              disabled={isSavingUser}
            >
              {isSavingUser ? (
                <ActivityIndicator size="small" color={THEME.colors.primary} />
              ) : (
                <Ionicons 
                  name={isEditing ? "checkmark-circle" : "create-outline"} 
                  size={24} 
                  color={isEditing ? "#10B981" : THEME.colors.textSecondary} 
                />
              )}
            </TouchableOpacity>
          </View>

          {/* SEÇÃO DE CONVITES RECEBIDOS PENDENTES */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Convites para Projetos</Text>
            
            {loadingInvites ? (
              <ActivityIndicator size="small" color={THEME.colors.primary} style={{ marginVertical: 10 }} />
            ) : invitations.length === 0 ? (
              <Text style={styles.emptyText}>Nenhum convite pendente para você.</Text>
            ) : (
              invitations.map((invite) => (
                <View key={invite.id} style={styles.inviteRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inviteProjectName}>{invite.project?.name}</Text>
                    <Text style={styles.inviteRoleText}>Função: {displayRole}</Text>
                  </View>
                  <View style={styles.actionGroup}>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.acceptBtn]} 
                      onPress={() => handleAcceptInvite(invite.id, invite.project?.name)}
                    >
                      <Ionicons name="checkmark" size={18} color="#FFF" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionBtn, styles.rejectBtn]} 
                      onPress={() => handleRejectInvite(invite.id, invite.project?.name)}
                    >
                      <Ionicons name="close" size={18} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* SAIR DA CONTA */}
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={18} color="#EF4444" />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>

        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.colors.background },
  scroll: { paddingTop: 18, paddingBottom: 28 },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: THEME.colors.surface,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 20,
  },
  avatar: { width: 54, height: 54, borderRadius: 18, backgroundColor: THEME.colors.inputBg, justifyContent: 'center', alignItems: 'center' },
  name: { fontFamily: 'Jakarta-Bold', fontSize: 16, color: THEME.colors.textPrimary },
  email: { marginTop: 2, fontFamily: 'Manrope-Regular', color: THEME.colors.textSecondary, fontSize: 13 },
  input: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 16,
    color: THEME.colors.textPrimary,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.primary,
    paddingVertical: 2,
    marginRight: 10,
  },
  editButton: { padding: 4 },
  infoSection: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sectionTitle: { fontFamily: 'Jakarta-Bold', fontSize: 16, marginBottom: 15, color: THEME.colors.textPrimary },
  emptyText: { fontFamily: 'Manrope-Regular', color: THEME.colors.textSecondary, fontSize: 14, textAlign: 'center', paddingVertical: 10 },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.inputBg,
  },
  inviteProjectName: { fontFamily: 'Jakarta-Bold', fontSize: 14, color: THEME.colors.textPrimary },
  inviteRoleText: { fontFamily: 'Manrope-Regular', fontSize: 12, color: THEME.colors.textSecondary, marginTop: 2 },
  actionGroup: { flexDirection: 'row', gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  acceptBtn: { backgroundColor: '#10B981' },
  rejectBtn: { backgroundColor: '#EF4444' },
  logoutButton: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
  },
  logoutText: { color: '#EF4444', fontFamily: 'Manrope-SemiBold' },
});