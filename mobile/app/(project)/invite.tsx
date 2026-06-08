import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView, Keyboard } from 'react-native';
import { useNavigation, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import SmartAlert from '@/components/common/SmartAlert';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import { api } from '@/services/api'; 

export default function InviteMember() {
  const navigation = useNavigation();
  const { id, name, color } = useLocalSearchParams();
  const { alertConfig, showAlert, hideAlert } = useAlert();

  // Estados para Convite
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estados para Busca Dinâmica de Usuários
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Estados para Convites Pendentes do Projeto
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);

  const projectColor = (color as string) || THEME.colors.primary;

  useLayoutEffect(() => {
    navigation.setOptions({
      title: 'Membros',
      headerTintColor: projectColor,
    });
  }, [navigation, projectColor]);

  // 1. Carregar Convites Pendentes do Projeto
  const loadPendingInvites = useCallback(async () => {
    setLoadingPending(true);
    try {
      const response = await api.get(`/invitations/project/${id}`);
      
      // Filtra para exibir apenas os convites deste projeto específico
      const projectInvites = response.data.filter((invite: any) => invite.projectId === id);
      setPendingInvites(projectInvites);
    } catch (error) {
      console.error("Erro ao buscar convites pendentes:", error);
    } finally {
      setLoadingPending(false);
    }
  }, [id]);

  useEffect(() => {
    loadPendingInvites();
  }, [loadPendingInvites]);

  // 2. Lógica de Busca Dinâmica com Debounce
  useEffect(() => {
    if (searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const response = await api.get(`/users/search?q=${searchQuery}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error("Erro na busca de usuários:", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // 3. Lógica de Envio (FastAPI)
  const handleSendInvite = async (targetEmail?: string) => {
    const finalEmail = targetEmail || email;
    
    if (!finalEmail.includes('@')) {
      return showAlert("Atenção", "Insira um e-mail válido.");
    }

    setLoading(true);
    try {
      await api.post(`/invitations/`, { 
        email: finalEmail.toLowerCase().trim(),
        projectId: id,
        role: "COLLECTOR" 
      });

      showAlert("Sucesso!", `Convite processado para ${finalEmail}`, () => {
        setEmail('');
        setSearchQuery('');
        setSearchResults([]);
        Keyboard.dismiss();
        loadPendingInvites(); // Atualiza a lista de pendentes após enviar
      });
    } catch (error: any) {
      const message = error.response?.data?.detail || "Erro ao convidar.";
      showAlert("Erro", message);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeInvite = async (inviteId: string, targetEmail: string) => {
  showAlert(
    "Revogar Convite", 
    `Deseja realmente cancelar o convite para ${targetEmail}?`, 
    async () => {
      try {
        // Adicionando a barra final '/' para evitar problemas de roteamento estrito do FastAPI
        await api.delete(`/invitations/${inviteId}/`);
        loadPendingInvites();
      } catch (error) {
        console.error("Erro ao revogar convite:", error);
      }
    }
  );
};

  const renderSearchItem = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.userCard} 
      onPress={() => handleSendInvite(item.email)}
    >
      <View style={[styles.avatarMini, { backgroundColor: projectColor + '20' }]}>
        <Text style={{ color: projectColor, fontWeight: 'bold' }}>{item.name[0]}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.userEmail}>{item.email}</Text>
      </View>
      <Ionicons name="add-circle" size={24} color={projectColor} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <SmartAlert {...alertConfig} onCancel={hideAlert} />

      <ScrollView stickyHeaderIndices={[1]} keyboardShouldPersistTaps="handled">
        <Container>
          <View style={styles.infoBox}>
            <View style={[styles.iconCircle, { backgroundColor: projectColor + '15' }]}>
              <Ionicons name="people-outline" size={30} color={projectColor} />
            </View>
            <Text style={styles.projectTitle}>{name}</Text>
            <Text style={styles.instruction}>Adicione colaboradores via busca ou e-mail.</Text>
          </View>
        </Container>

        {/* INPUT DE BUSCA DINÂMICA */}
        <View style={{ backgroundColor: THEME.colors.background, paddingBottom: 10 }}>
          <Container>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={THEME.colors.textSecondary} style={{ marginLeft: 15 }} />
              <TextInput 
                style={styles.searchInput}
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={THEME.colors.textSecondary}
              />
              {isSearching && <ActivityIndicator size="small" color={projectColor} style={{ marginRight: 15 }} />}
            </View>
          </Container>
        </View>

        <Container>
          {/* RESULTADOS DA BUSCA */}
          {searchResults.length > 0 && (
            <View style={styles.resultsBox}>
              {searchResults.map((user) => (
                <View key={user.id}>{renderSearchItem({ item: user })}</View>
              ))}
            </View>
          )}

          {/* CONVITE DIRETO POR E-MAIL */}
          <View style={styles.manualInviteSection}>
            <Text style={styles.label}>Ou convite direto por e-mail</Text>
            <View style={styles.row}>
              <TextInput 
                style={[styles.input, { flex: 1 }]}
                value={email}
                onChangeText={setEmail}
                placeholder="email@exemplo.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={THEME.colors.textSecondary}
              />
              <TouchableOpacity 
                style={[styles.btnSend, { backgroundColor: projectColor }]} 
                onPress={() => handleSendInvite()}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="#FFF" /> : <Ionicons name="send" size={20} color="#FFF" />}
              </TouchableOpacity>
            </View>
          </View>

          {/* LISTA DE CONVITES PENDENTES */}
          <View style={styles.pendingSection}>
            <Text style={styles.label}>
              Convites Pendentes ({pendingInvites.length})
            </Text>
            
            {loadingPending ? (
              <ActivityIndicator size="small" color={projectColor} style={{ marginTop: 10 }} />
            ) : pendingInvites.length > 0 ? (
              <View style={styles.pendingBox}>
                {pendingInvites.map((invite) => (
                  <View key={invite.id} style={styles.pendingCard}>
                    <View style={[styles.avatarMini, { backgroundColor: THEME.colors.inputBg }]}>
                      <Ionicons name="mail-unread-outline" size={16} color={THEME.colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pendingEmail} numberOfLines={1}>{invite.email}</Text>
                      <Text style={styles.pendingDate}>
                        Enviado em: {new Date(invite.createdAt).toLocaleDateString('pt-BR')}
                      </Text>
                    </View>
                    
                    {/* Botão para revogar/cancelar o convite se sua API permitir */}
                    <TouchableOpacity 
                      onPress={() => handleRevokeInvite(invite.id, invite.email)}
                      style={styles.btnRevoke}
                    >
                      <Ionicons name="close-circle-outline" size={20} color={THEME.colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noPendingText}>Nenhum convite aguardando resposta.</Text>
            )}
          </View>

        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.colors.background },
  infoBox: { alignItems: 'center', marginTop: 20, marginBottom: 15 },
  iconCircle: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  projectTitle: { ...THEME.fonts.title, fontSize: 18 },
  instruction: { ...THEME.fonts.body, fontSize: 13, color: THEME.colors.textSecondary, textAlign: 'center' },
  
  searchContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: THEME.colors.surface, 
    borderRadius: 15, 
    borderWidth: 1, 
    borderColor: THEME.colors.border,
    height: 55
  },
  searchInput: { flex: 1, paddingHorizontal: 10, color: THEME.colors.textPrimary, fontFamily: 'Manrope-Regular' },
  
  resultsBox: { 
    backgroundColor: THEME.colors.surface, 
    borderRadius: 15, 
    marginTop: -5, 
    borderWidth: 1, 
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10
  },
  userCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: THEME.colors.border, gap: 12 },
  avatarMini: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  userName: { fontFamily: 'Manrope-Bold', fontSize: 14, color: THEME.colors.textPrimary },
  userEmail: { fontSize: 12, color: THEME.colors.textSecondary },

  manualInviteSection: { marginTop: 30 },
  label: { ...THEME.fonts.body, fontFamily: 'Manrope-Bold', marginBottom: 10, fontSize: 14 },
  row: { flexDirection: 'row', gap: 10 },
  input: { 
    backgroundColor: THEME.colors.surface, 
    padding: 15, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: THEME.colors.border,
    color: THEME.colors.textPrimary
  },
  btnSend: { width: 55, height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Estilos da Seção Pendentes
  pendingSection: { marginTop: 35, paddingBottom: 60 },
  pendingBox: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden'
  },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    gap: 12
  },
  pendingEmail: { fontFamily: 'Manrope-SemiBold', fontSize: 14, color: THEME.colors.textPrimary },
  pendingDate: { fontSize: 11, color: THEME.colors.textSecondary, marginTop: 2 },
  btnRevoke: { padding: 4 },
  noPendingText: { fontFamily: 'Manrope-Regular', fontSize: 13, color: THEME.colors.textSecondary, fontStyle: 'italic', marginTop: 4 }
});