import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';

// Importe seus novos componentes (ajuste o caminho conforme sua pasta)
import { ProjectFormList } from  '@/presentation/projects/components/ProjectFormList';
import { ProjectTeamList } from '@/presentation/projects/components/ProjectTeamList';

import { useAuthStore } from '@/presentation/auth/store/useAuthStore'; // Importe seu store


export default function ProjectDetails() {
  const { id, name: initialName } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [project, setProject] = useState<any>(null);
  const [forms, setForms] = useState<any[]>([]);

  const { user } = useAuthStore()
 
  const isOwner = project?.ownerId === user?.id;

  const loadProjectData = useCallback(async () => {
  if (!refreshing) setLoading(true);
  try {
    const projectRepo = new ProjectRepositoryImpl();
    const formRepo = new FormRepositoryImpl(); // Instancia o repositório

    // 1. Busca os dados do projeto (Dono e Membros) via Repo
    const projectData = await projectRepo.findById(id as string);
    setProject(projectData);
    
    // 2. Busca os formulários via Repo (Ele já resolve se é Online ou Cache SQL)
    const formsData = await formRepo.getByProject(id as string);
    setForms(formsData);

  } catch (error) {
    console.error("Erro ao carregar dados:", error);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [id, refreshing]);

  useFocusEffect(useCallback(() => { loadProjectData(); }, [loadProjectData]));

  const projectColor = project?.color || project?.themeColor || THEME.colors.primary;

  if (loading && !refreshing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background }}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <Stack.Screen 
  options={{ 
    title: project?.name || (initialName as string) || 'Projeto',
    headerTintColor: projectColor,
    headerTitleStyle: { fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
    // Só renderiza o botão de edit se for o dono
    headerRight: () => isOwner ? (
      <TouchableOpacity 
        onPress={() => router.push({ pathname: "/(project)/edit", params: { id } })} 
        style={{ marginRight: 10 }}
      >
        <Ionicons name="settings-outline" size={22} color={projectColor} />
      </TouchableOpacity>
    ) : null
  }} 
/>

      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadProjectData(); }} colors={[projectColor]} />
        }
      >
        <Container>
          {/* Seção de Formulários */}
         <ProjectFormList 
            forms={forms} 
            projectColor={projectColor} 
            projectId={id as string}
            isOwner={isOwner} 
            onFormPress={(formId) => {
              // A tela de detalhes do formulario resolve o fluxo de dono/colaborador.
              router.push(`/(form)/${formId}`);
            }} 
            onNewFormPress={isOwner ? () => router.push(`/(form)/new?projectId=${id}&color=${encodeURIComponent(projectColor)}`) : undefined}
          />

          {/* Seção de Equipe */}
          <ProjectTeamList 
            owner={project?.owner}
            members={project?.members}
            projectColor={projectColor}
            onInvitePress={isOwner ? () => router.push({
              pathname: "/(project)/invite",
              params: { id, name: project?.name, color: projectColor }
            }) : undefined}
            isOwner={isOwner} // Passe a prop isOwner
          />
</Container>
      </ScrollView>
    </View>
  );
}