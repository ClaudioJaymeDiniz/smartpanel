import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { 
  View, Text, StyleSheet, ScrollView, 
  TouchableOpacity, RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import Container from '@/src/components/common/Container';
import { THEME } from '@/src/styles/theme';
import Logo from '@/src/components/common/Logo';
import DeveloperFooter from '@/src/components/common/DeveloperFooter';
import { projectService } from '@/src/services/projectService';
import { useAuth } from '@/src/store/AuthContext'; 
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';

export default function Home() {
  const router = useRouter();
  const { isOffline, user } = useAuth(); 
  
  const [projects, setProjects] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Função de carga (Memorizada para não recriar a cada render)
  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await projectService.getAll(isOffline);
      setProjects(data || []); // Garante que nunca seja null
    } catch (error) {
      console.error("Falha ao carregar projetos:", error);
    } finally {
      setRefreshing(false);
    }
  }, [isOffline]); // Só muda se o status da internet mudar

  // 2. O Gatilho Principal: Foco na Tela
  // Ele substitui o useEffect inicial e garante o refresh ao voltar do Edit
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // O useEffect aqui é opcional, mas se quiser manter para quando o isOffline mudar
  // enquanto o usuário ESTÁ na tela, pode deixar, mas o loadData já cobre isso.

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ 
        headerTitle: () => <Logo size={20} />,
        headerStyle: { backgroundColor: THEME.colors.background },
        headerShadowVisible: false 
      }} />

      {/* Banner de Offline se necessário */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>Trabalhando em modo Offline</Text>
        </View>
      )}
      
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
        <Container>
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Olá, {user?.name?.split(' ')[0] || 'Usuário'}!</Text>
            <Text style={styles.subtitle}>O que vamos organizar hoje no SmartPanel?</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seus Projetos</Text>
            
            <View style={styles.projectGrid}>
                {projects.length > 0 ? (
                  projects.map((item) => (
                    <TouchableOpacity 
                      key={item.id} 
                      style={styles.projectCard} 
                      onPress={() => {
                        router.push({
                          pathname: "/(project)/[id]",
                          params: { id: item.id, name: item.name }
                        });
                      }}
                    >
                      {/* Usamos a cor do projeto vinda do banco ou a primária como fallback */}
                      <Ionicons 
                        name="folder" 
                        size={30} 
                        color={item.themeColor || THEME.colors.primary} 
                      />
                      
                      <Text style={styles.projectLabel} numberOfLines={1}>{item.name}</Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Nenhum projeto encontrado.</Text>
                )}
                
                {/* Botão Novo Projeto - Apontando para o grupo (project) */}
                <TouchableOpacity 
                  style={[styles.projectCard, styles.newProject]} 
                  onPress={() => router.push('/(project)/new')}
                >
                  <Ionicons name="add" size={30} color={THEME.colors.textSecondary} />
                  <Text style={styles.projectLabel}>Novo</Text>
                </TouchableOpacity>
              </View>
          </View>
        </Container>
        
        <DeveloperFooter />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.colors.background },
  scrollContent: { flexGrow: 1, paddingTop: 20 },
  
  offlineBanner: { backgroundColor: THEME.colors.error, padding: 4, alignItems: 'center' },
  offlineText: { color: '#FFF', fontSize: 11, fontFamily: 'Manrope-SemiBold' },

  welcomeSection: { marginBottom: 30 },
  welcomeText: { ...THEME.fonts.title, fontSize: 24 },
  subtitle: { ...THEME.fonts.subtitle, fontSize: 14 },

  section: { marginBottom: 30 },
  sectionTitle: { ...THEME.fonts.title, fontSize: 18, marginBottom: 15 },

  projectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  projectCard: {
    width: '30%', // Ajuste para 3 por linha ou 48% para 2 por linha
    aspectRatio: 1,
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  newProject: { borderStyle: 'dashed', backgroundColor: 'transparent' },
  projectLabel: { 
    ...THEME.fonts.body, 
    fontSize: 11, 
    marginTop: 8, 
    textAlign: 'center',
    paddingHorizontal: 5
  },
  emptyText: { color: THEME.colors.textSecondary, fontFamily: 'Manrope-Regular', width: '100%' },
  
});