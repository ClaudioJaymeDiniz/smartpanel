import React, { useState, useCallback, useEffect } from 'react';
import { View, Text as RNText, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';

// Importe seus novos componentes (ajuste o caminho conforme sua pasta)
import { ProjectFormList } from  '@/presentation/projects/components/ProjectFormList';
import { ProjectTeamList } from '@/presentation/projects/components/ProjectTeamList';

import { useAuthStore } from '@/presentation/auth/store/useAuthStore'; // Importe seu store
import { useProjectStore } from '@/presentation/projects/store/useProjectStore';


export default function ProjectDetails() {
  const { id, name: initialName } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);
  const [activeSection, setActiveSection] = useState<'forms' | 'members'>('forms');

  const { user } = useAuthStore()
  const { setSelectedProject } = useProjectStore();
 
  const isOwner = project?.ownerId === user?.id;
  const projectColor = project?.color || project?.themeColor || THEME.colors.primary;

  useEffect(() => {
    navigation.setOptions({
      title: project?.name || (initialName as string) || 'Projeto',
      headerTintColor: projectColor,
      headerTitleStyle: { fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
      headerRight: () => isOwner ? (
        <TouchableOpacity 
          onPress={() => router.push({ pathname: "/(project)/edit", params: { id } })} 
          style={{ marginRight: 10 }}
        >
          <Ionicons name="settings-outline" size={22} color={projectColor} />
        </TouchableOpacity>
      ) : null,
    });
  }, [id, initialName, isOwner, navigation, project?.name, projectColor, router]);

  const loadProjectData = useCallback(async () => {
  if (!refreshing) setLoading(true);
  try {
    const projectRepo = new ProjectRepositoryImpl();
    const formRepo = new FormRepositoryImpl();

    const projectData = await projectRepo.findById(id as string);
    setProject(projectData);
    setSelectedProject(projectData);
    
    const formsData = await formRepo.getByProject(id as string);
    setForms(formsData);

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [id, refreshing]);

  useEffect(() => {
    return () => setSelectedProject(null);
  }, [setSelectedProject]);

  useFocusEffect(useCallback(() => { loadProjectData(); }, [loadProjectData]));

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProjectData(); }} colors={[projectColor]} />
        }
        
      >
        <Container>
          
          <View style={styles.heroCard}>
            {/* Icone e Botão configurações (apenas para o dono)
            <View style={styles.heroTopRow}>
              <View style={[styles.heroBadge, { backgroundColor: `${projectColor}18` }]}>
                <Ionicons name="layers-outline" size={22} color={projectColor} />
              </View>
              <TouchableOpacity
                style={styles.settingsChip}
                onPress={() => router.push({ pathname: '/(project)/edit', params: { id } })}
              >
                <Ionicons name="settings-outline" size={16} color={projectColor} />
                <RNText style={[styles.settingsChipText, { color: projectColor }]}>Configurações</RNText>
              </TouchableOpacity>
            </View>
            */}

            

            <RNText style={styles.projectTitle}>{project?.name || (initialName as string) || 'Projeto'}</RNText>
            <RNText style={styles.projectDescription} numberOfLines={3}>
              {project?.description || 'Organize formulários, convites e respostas em um único espaço de trabalho.'}
            </RNText>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <RNText style={styles.summaryValue}>{forms.length}</RNText>
                <RNText style={styles.summaryLabel}>Formulários</RNText>
              </View>
              <View style={styles.summaryCard}>
                <RNText style={styles.summaryValue}>{project?.members?.length || 0}</RNText>
                <RNText style={styles.summaryLabel}>Membros</RNText>
              </View>
            </View>
          </View>

          <View style={styles.segmentedControl}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                activeSection === 'forms' && {
                  backgroundColor: projectColor,
                  borderColor: projectColor,
                },
              ]}
              onPress={() => setActiveSection('forms')}
            >
              <Ionicons
                name="document-text-outline"
                size={16}
                color={activeSection === 'forms' ? '#FFF' : THEME.colors.textSecondary}
              />
              <RNText style={
                [styles.segmentText, activeSection === 'forms' && styles.segmentTextActive]}>
                  Formulários</RNText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                activeSection === 'members' && {
                  backgroundColor: projectColor,
                  borderColor: projectColor,
                },
              ]}
              onPress={() => setActiveSection('members')}
            >
              <Ionicons
                name="people-outline"
                size={16}
                color={activeSection === 'members' ? '#FFF' : THEME.colors.textSecondary}
              />
              <RNText style={[styles.segmentText, activeSection === 'members' && styles.segmentTextActive]}>Membros</RNText>
            </TouchableOpacity>
          </View>

          {activeSection === 'forms' ? (
            <>
              <ProjectFormList 
                forms={forms} 
                projectColor={projectColor} 
                projectId={id as string}
                isOwner={isOwner} 
                onFormPress={(formId) => {
                  router.push(`/(form)/${formId}`);
                }} 
                onNewFormPress={isOwner ? () => router.push(`/(form)/new?projectId=${id as string}&color=${encodeURIComponent(projectColor)}`) : undefined}
              />

              {isOwner ? (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: projectColor }]}
                  onPress={() => router.push(`/(form)/new?projectId=${id}&color=${encodeURIComponent(projectColor)}`)}
                >
                  <Ionicons name="add" size={20} color="#FFF" />
                  <RNText style={styles.actionButtonText}>Criar novo formulário</RNText>
                </TouchableOpacity>
              ) : null}
            </>
          ) : (
            <>
              <ProjectTeamList 
                owner={project?.owner}
                members={project?.members}
                projectColor={projectColor}
                onInvitePress={isOwner ? () => router.push({
                  pathname: '/(project)/invite',
                  params: { id, name: project?.name, color: projectColor }
                }) : undefined}
                isOwner={isOwner}
              />

              {isOwner ? (
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary, { borderColor: projectColor }]}
                  onPress={() => router.push({
                    pathname: '/(project)/invite',
                    params: { id, name: project?.name, color: projectColor }
                  })}
                >
                  <Ionicons name="person-add-outline" size={20} color={projectColor} />
                  <RNText style={[styles.actionButtonText, { color: projectColor }]}>Convidar pessoas</RNText>
                </TouchableOpacity>
              ) : null}
            </>
          )}
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = {
  heroCard: {
    borderRadius: 24,
    padding: 18,
    marginTop: 6,
    marginBottom: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  heroTopRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    marginBottom: 14,
  },
  heroBadge: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
  },
  settingsChip: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: THEME.colors.inputBg,
  },
  settingsChipText: {
    fontFamily: 'Manrope-SemiBold',
    fontSize: 12,
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
    flexDirection: 'row' as const,
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
  segmentedControl: {
    flexDirection: 'row' as const,
    gap: 10,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  segmentButtonActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  segmentText: {
    fontFamily: 'Manrope-SemiBold',
    color: THEME.colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFF',
  },
  actionButton: {
    marginTop: 16,
    minHeight: 52,
    borderRadius: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: 8,
    paddingHorizontal: 16,
  },
  actionButtonSecondary: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
  },
  actionButtonText: {
    fontFamily: 'Manrope-Bold',
    color: '#FFF',
  },
};