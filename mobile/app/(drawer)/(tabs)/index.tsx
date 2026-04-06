import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, RefreshControl 
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
      const [data, publicData] = await Promise.all([
        projectRepo.listActive(),
        formRepo.getPublicForms(),
      ]);
      // Console log para você conferir no terminal o nome exato do campo da cor
      console.log("Projetos carregados:", data); 
      setProjects(data);
      
      // Filtra formulários públicos para remover aqueles do próprio usuário (dono)
      const filteredPublicForms = publicData.filter(form => form.ownerId !== user?.id);
      setPublicForms(filteredPublicForms);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

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
                const statusColor = isOwner ? THEME.colors.primary : '#F59E0B';

                return (
                  <TouchableOpacity 
                    key={item.id} 
                    style={styles.projectCard} 
                    onPress={() => router.push({ 
                      pathname: "/(project)/[id]", 
                      params: { id: item.id, name: item.name, color: projectColor } 
                    })}
                  >
                    <View style={[styles.iconCircle, { backgroundColor: projectColor + '15' }]}>
                      <Ionicons name={isOwner ? "folder" : "people"} size={28} color={projectColor} />
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

      {/* Footer fora do Container para poder ocupar a largura total se necessário, ou dentro se preferir margem */}
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





{/*

import React, { useState, useCallback } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as NetInfo from '@react-native-community/netinfo';

import Container from '@/components/common/Container';
import { THEME } from '@/styles/theme';
import DeveloperFooter from '@/components/common/DeveloperFooter';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { Project } from '@/core/projects/domain/entities/Project';

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const projectRepo = new ProjectRepositoryImpl();

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
      const data = await projectRepo.listActive();
      // Console log para você conferir no terminal o nome exato do campo da cor
      console.log("Projetos carregados:", data); 
      setProjects(data);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  return (
    <View style={styles.mainContainer}>
      // Banner Offline se isOffline for true 
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[THEME.colors.primary]} />}
      >
        <Container>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Olá, {user?.name?.split(' ')[0] || 'Usuário'}!</Text>
            <Text style={styles.subtitle}>Gerencie seus formulários e coletas.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projetos Ativos</Text>
            
            <View style={styles.projectGrid}>
                {projects.map((item) => {
                  const projectColor = item.color || (item as any).themeColor || THEME.colors.primary;
                  
                  // Lógica de Status (Mesmo que o back ainda não mande, o front já se prepara)
                  const isArchived = (item as any).deletedAt !== null || (item as any).status === 'archived';
                  const statusLabel = isArchived ? 'Arquivado' : 'Ativo';
                  const statusColor = isArchived ? '#94A3B8' : '#10B981'; // Cinza vs Verde Sucesso

                  return (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.projectCard} 
                      onPress={() => router.push({ pathname: "/(project)/[id]", params: { id: item.id } })}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: projectColor + '15' }]}>
                         <Ionicons name="folder" size={28} color={projectColor} />
                      </View>
                      
                      <Text style={styles.projectLabel} numberOfLines={1}>{item.name}</Text>
                      
                      <View style={styles.cardFooter}>
                         <View style={[styles.dot, { backgroundColor: statusColor }]} />
                         <Text style={[styles.projectSubLabel, { color: statusColor }]}>{statusLabel}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                
                 // BOTÃO NOVO PROJETO - REESTILIZADO 
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
        </Container>
        <DeveloperFooter />
      </ScrollView>
    </View>
  );
} /*}
{/*
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

  projectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
 
  projectLabel: { 
    ...THEME.fonts.body, 
    fontSize: 15, 
    fontFamily: 'Jakarta-Bold', 
    textAlign: 'center',
    color: THEME.colors.textPrimary
  },

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
  }
});
*/}