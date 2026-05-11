import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, RefreshControl, Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NetInfo from '@react-native-community/netinfo';

import Container from '@/components/common/Container';
import { THEME } from '@/styles/theme';
import DeveloperFooter from '@/components/common/DeveloperFooter';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Project } from '@/core/projects/domain/entities/Project';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [publicForms, setPublicForms] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const projectRepo = new ProjectRepositoryImpl();
  const formRepo = new FormRepositoryImpl();

  // Monitor de Conexão
  useFocusEffect(
    useCallback(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOffline(!state.isConnected);
      });
      return () => unsubscribe();
    }, [])
  );

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const [data, archivedData, publicData] = await Promise.all([
        projectRepo.listActive(),
        projectRepo.listArchived(),
        formRepo.getPublicForms(),
      ]);
      // Console log para você conferir no terminal o nome exato do campo da cor
      console.log("Projetos carregados:", data); 
      setProjects(data);
      setArchivedProjects(archivedData);
      
      // Filtra formulários públicos para remover aqueles do próprio usuário (dono)
      const filteredPublicForms = publicData.filter(form => form.ownerId !== user?.id);
      setPublicForms(filteredPublicForms);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleRestoreArchivedProject = async (projectId: string) => {
    try {
      await projectRepo.restore(projectId);
      await loadData();
    } catch (error) {
      console.error('Erro ao restaurar projeto:', error);
    }
  };

  const handleDeleteArchivedProject = async (projectId: string) => {
    try {
      await projectRepo.permanentDelete(projectId);
      setArchivedProjects((current) => current.filter((project) => project.id !== projectId));
      await loadData();
      Alert.alert('Sucesso', 'Projeto deletado definitivamente.');
    } catch (error) {
      console.error('Erro ao excluir projeto arquivado:', error);
      const message = error instanceof Error
        ? error.message
        : 'Nao foi possivel deletar o projeto. Tente novamente com internet.';
      Alert.alert('Erro ao deletar', message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
  <View style={styles.mainContainer}>
    <ScrollView 
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={loadData} 
          colors={[THEME.colors.primary]} 
        />
      }
    >
      {/* O Container entra aqui para dar o padding lateral em tudo */}
      <Container>
        
        {/* Sua seção de boas-vindas agora alinhada */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Olá, {user?.name?.split(' ')[0] || 'Usuário'}!
          </Text>
          <Text style={styles.subtitle}>
            Gerencie seus formulários e coletas.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Projetos Ativos</Text>
          
          <View style={styles.projectGrid}>
            {/* 1. SE TIVER PROJETOS: RENDERIZA A LISTA */}
            {projects.length > 0 ? (
              projects.map((item) => {
                const projectColor = item.color || (item as any).themeColor || THEME.colors.primary;
                const isOwner = item.ownerId === user?.id;
                const isArchived = (item as any).deletedAt !== null;
                const statusLabel = isArchived ? 'Arquivado' : (isOwner ? 'Meu Projeto' : 'Colaborador');
                const statusColor = isArchived ? '#94A3B8' : (isOwner ? THEME.colors.primary : '#F59E0B');
                const cardCircleColor = isArchived ? '#E2E8F0' : `${projectColor}15`;
                const iconColor = isArchived ? '#94A3B8' : projectColor;

                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.projectCard} 
                    onPress={() => router.push({ 
                      pathname: "/(project)/[id]", 
                      params: { id: item.id, name: item.name, color: projectColor } 
                    })}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: cardCircleColor }]}> 
                      <Ionicons name={isArchived ? "archive" : (isOwner ? "folder" : "people")} size={28} color={iconColor} />
                    </View>
                    <Text style={styles.projectLabel} numberOfLines={1}>{item.name}</Text>
                    <View style={styles.cardFooter}>
                      <View style={[styles.dot, { backgroundColor: statusColor }]} />
                      <Text style={[styles.projectSubLabel, { color: statusColor }]}>{statusLabel}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              /* 2. EMPTY STATE */
              !refreshing && (
                <View style={styles.emptyStateContainer}>
                  <Ionicons name="folder-open-outline" size={50} color={THEME.colors.border} />
                  <Text style={styles.emptyTitle}>Nenhum projeto encontrado</Text>
                  <Text style={styles.emptySubtitle}>Você ainda não criou ou foi convidado para um projeto.</Text>
                </View>
              )
            )}

            {/* 3. BOTÃO NOVO PROJETO */}
            <TouchableOpacity 
              style={styles.newProjectCard} 
              onPress={() => router.push('/(project)/new')}
            >
              <View style={styles.newProjectIconContainer}>
                <Ionicons name="add" size={32} color={THEME.colors.primary} />
              </View>
              <Text style={styles.newProjectLabel}>Novo Projeto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {archivedProjects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Arquivados</Text>

            {archivedProjects.map((item) => {
              const projectColor = item.color || (item as any).themeColor || THEME.colors.primary;
              const isArchived = (item as any).deletedAt !== null;

              return (
                <View key={item.id} style={styles.archivedCard}>
                  <TouchableOpacity
                    style={styles.archivedMain}
                    onPress={() => router.push({
                      pathname: '/(project)/[id]',
                      params: { id: item.id, name: item.name, color: projectColor },
                    })}
                  >
                    <View style={styles.archivedIconCircle}>
                      <Ionicons name="archive" size={22} color="#94A3B8" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.archivedTitle} numberOfLines={1}>{item.name}</Text>
                      <Text style={styles.archivedSubtitle}>Projeto arquivado</Text>
                    </View>
                  </TouchableOpacity>

                  <View style={styles.archivedActions}>
                    <TouchableOpacity
                      style={styles.restoreBtn}
                      onPress={() => handleRestoreArchivedProject(item.id)}
                    >
                      <Ionicons name="arrow-undo-outline" size={16} color={THEME.colors.primary} />
                      <Text style={styles.restoreText}>Restaurar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() =>
                        Alert.alert(
                          'Excluir definitivamente?',
                          'Essa acao nao pode ser desfeita.',
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Excluir',
                              style: 'destructive',
                              onPress: () => handleDeleteArchivedProject(item.id),
                            },
                          ]
                        )
                      }
                    >
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text style={styles.deleteText}>Deletar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Formularios Publicos</Text>

          {publicForms.length === 0 ? (
            <View style={styles.publicEmptyState}>
              <Ionicons name="globe-outline" size={34} color={THEME.colors.border} />
              <Text style={styles.publicEmptyTitle}>Nenhum formulario publico no momento</Text>
              <Text style={styles.publicEmptySubtitle}>Quando um projeto publicar formularios, eles aparecerao aqui.</Text>
            </View>
          ) : (
            publicForms.map((form) => {
              const accent = form.projectColor || THEME.colors.primary;
              return (
                <TouchableOpacity
                  key={form.id}
                  style={styles.publicCard}
                  onPress={() => router.push({ pathname: '/(form)/[id]', params: { id: form.id } })}
                >
                  <View style={[styles.publicIconCircle, { backgroundColor: `${accent}15` }]}> 
                    <Ionicons name="document-text-outline" size={20} color={accent} />
                  </View>

                  <View style={styles.publicContent}>
                    <Text style={styles.publicTitle} numberOfLines={1}>{form.title}</Text>
                    <Text style={styles.publicMeta} numberOfLines={1}>Projeto: {form.projectName}</Text>
                    {form.description ? (
                      <Text style={styles.publicDescription} numberOfLines={2}>{form.description}</Text>
                    ) : null}
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={THEME.colors.border} />
                </TouchableOpacity>
              );
            })
          )}
        </View>

      </Container>

      <DeveloperFooter />
      
    </ScrollView>
  </View>
);
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.colors.background },
  scrollContent: { flexGrow: 1, paddingTop: 10 },
  
  offlineBanner: { 
    flexDirection: 'row', 
    backgroundColor: THEME.colors.error || '#DC2626', 
    padding: 8, 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 8
  },
  offlineText: { color: '#FFF', fontSize: 12, fontFamily: 'Manrope-SemiBold' },

  welcomeSection: { marginBottom: 25 },
  welcomeText: { ...THEME.fonts.title, fontSize: 24 },
  subtitle: { ...THEME.fonts.subtitle, fontSize: 14, color: THEME.colors.textSecondary },

  section: { marginBottom: 30 },
  sectionTitle: { ...THEME.fonts.title, fontSize: 18, marginBottom: 15 },

  projectGrid: { 
  flexDirection: 'row', 
  flexWrap: 'wrap', 
  justifyContent: 'space-between', // Garante que um card vá para cada ponta
  rowGap: 14, // Espaço entre as linhas
},
 
  projectLabel: { 
    ...THEME.fonts.body, 
    fontSize: 15, 
    fontFamily: 'Jakarta-Bold', 
    textAlign: 'center',
    color: THEME.colors.textPrimary
  },
  archivedCard: {
    backgroundColor: THEME.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    marginBottom: 12,
  },
  archivedMain: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  archivedIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  archivedTitle: { ...THEME.fonts.body, fontFamily: 'Jakarta-Bold', fontSize: 15, color: THEME.colors.textPrimary },
  archivedSubtitle: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  archivedActions: { flexDirection: 'row', gap: 10, marginTop: 12 },
  restoreBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
  },
  restoreText: { color: THEME.colors.primary, fontFamily: 'Manrope-SemiBold', fontSize: 12 },
  deleteBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
  },
  deleteText: { color: '#EF4444', fontFamily: 'Manrope-SemiBold', fontSize: 12 },

  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
 
  newProject: { 
    borderStyle: 'dashed', 
    backgroundColor: 'transparent',
    justifyContent: 'center'
  },
  newProjectIcon: {
    marginBottom: 8
  },
  projectCard: {
    width: '47%', 
    backgroundColor: THEME.colors.surface,
    borderRadius: 24, 
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },

 
  newProjectCard: {
    width: '47%',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: THEME.colors.primary + '30', 
    borderStyle: 'dashed',
    backgroundColor: THEME.colors.primary + '05', 
  },
  newProjectIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: THEME.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  newProjectLabel: {
    fontFamily: 'Manrope-Bold',
    fontSize: 14,
    color: THEME.colors.primary,
  },

  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12
  },
  
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    backgroundColor: THEME.colors.inputBg, 
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12
  },
  
  projectSubLabel: {
    fontSize: 10,
    fontFamily: 'Manrope-Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  emptyStateContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    backgroundColor: THEME.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
    borderStyle: 'dashed'
  },
  emptyTitle: {
    ...THEME.fonts.title,
    fontSize: 16,
    color: THEME.colors.textPrimary,
    marginTop: 10
  },
  emptySubtitle: {
    ...THEME.fonts.body,
    fontSize: 13,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 30,
    marginTop: 5
  },
  publicCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    marginBottom: 10,
  },
  publicIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  publicContent: { flex: 1 },
  publicTitle: {
    color: THEME.colors.textPrimary,
    fontFamily: 'Jakarta-Bold',
    fontSize: 15,
  },
  publicMeta: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  publicDescription: {
    color: THEME.colors.textSecondary,
    fontSize: 12,
    marginTop: 6,
  },
  publicEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  publicEmptyTitle: {
    marginTop: 8,
    fontFamily: 'Jakarta-Bold',
    color: THEME.colors.textPrimary,
    fontSize: 14,
  },
  publicEmptySubtitle: {
    marginTop: 4,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
});