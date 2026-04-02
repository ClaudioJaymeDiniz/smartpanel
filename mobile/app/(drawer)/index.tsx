import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '@/src/store/AuthContext';
import { projectService } from '@/src/services/projectService';
import { THEME } from '@/src/styles/theme';
import DeveloperFooter from '@/src/components/common/DeveloperFooter';
import Container from '@/src/components/common/Container';

export default function Home() {
  const { user, isOffline } = useAuth();
  const [projects, setProjects] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    setRefreshing(true);
    const data = await projectService.getAll(isOffline);
    setProjects(data);
    setRefreshing(false);
  };

  useEffect(() => {
    loadData();
  }, [isOffline]); // Recarrega se o status da internet mudar

  return (
    <View style={styles.mainContainer}>
      {/* Banner de Offline (Acolhedor mas informativo) */}
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline" size={14} color="#FFF" />
          <Text style={styles.offlineText}>Modo Offline: Usando dados locais</Text>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} colors={[THEME.colors.primary]} />
        }
      >
        <Container>
          <View style={styles.header}>
            <Text style={styles.welcome}>Olá, {user?.name?.split(' ')[0] || 'Usuário'} 👋</Text>
            <Text style={styles.subtitle}>Gerencie seus projetos e formulários.</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Seus Projetos</Text>
            
            {projects.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={40} color={THEME.colors.border} />
                <Text style={styles.emptyText}>Nenhum projeto encontrado.</Text>
              </View>
            ) : (
              <View style={styles.projectGrid}>
                {projects.map((project: any) => (
                  <TouchableOpacity key={project.id} style={styles.projectCard}>
                    <View style={styles.iconCircle}>
                      <Ionicons name="folder" size={24} color={THEME.colors.primary} />
                    </View>
                    <Text style={styles.projectLabel} numberOfLines={1}>{project.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
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
  scrollContent: { flexGrow: 1, paddingTop: 20 },
  
  offlineBanner: {
    backgroundColor: THEME.colors.error, // Rose Red
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  offlineText: { ...THEME.fonts.body, color: '#FFF', fontSize: 11 },

  header: { marginBottom: 30, paddingHorizontal: 5 },
  welcome: { ...THEME.fonts.title, fontSize: 24 },
  subtitle: { ...THEME.fonts.subtitle, fontSize: 14 },

  section: { marginBottom: 30 },
  sectionTitle: { ...THEME.fonts.title, fontSize: 18, marginBottom: 15 },

  projectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  projectCard: {
    width: '48%', // Dois cards por linha
    backgroundColor: THEME.colors.surface,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0FDF4',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  projectLabel: { ...THEME.fonts.body, fontSize: 14, color: THEME.colors.textPrimary },
  
  emptyState: { alignItems: 'center', marginTop: 40 },
  emptyText: { ...THEME.fonts.body, color: THEME.colors.textSecondary, marginTop: 10 }
});