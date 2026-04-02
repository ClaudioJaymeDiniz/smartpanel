import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/src/styles/theme';
import { COLORS } from '@/src/styles/colors';
import Container from '@/src/components/common/Container';
import { api } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';

interface FormItem {
  id: string;
  title: string;
  responses_count?: number;
  
}


export default function ProjectDetails() {
  const { id, name } = useLocalSearchParams();
  const { isOffline } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [projectColor, setProjectColor] = useState(COLORS.primary);

  const fetchProjectData = async () => {
    try {
      // Busca simultânea: Formulários e Detalhes do Projeto (para pegar a cor)
      const [formsRes, projectRes] = await Promise.all([
        api.get(`/projects/${id}/forms`),
        api.get(`/projects/${id}`)
      ]);

      setForms(formsRes.data);
      if (projectRes.data.themeColor) {
        setProjectColor(projectRes.data.themeColor);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do projeto:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProjectData();
  };

  const renderFormItem = ({ item }: any) => (
    <TouchableOpacity 
      style={styles.formCard}
      onPress={() => router.push(`/(project)/form/${item.id}`)}
    >
      <View style={[styles.iconBox, { backgroundColor: projectColor + '15' }]}>
        <Ionicons name="document-text" size={22} color={projectColor} />
      </View>
      <View style={styles.formInfo}>
        <Text style={styles.formTitle}>{item.title}</Text>
        <Text style={styles.formMeta}>{item.responses_count || 0} envios</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.border} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen 
        options={{ 
          title: (name as string) || 'Projeto',
          headerRight: () => (
            <TouchableOpacity 
              onPress={() => router.push(`/(project)/edit?id=${id}`)}
              style={{ marginRight: 10 }}
            >
              <Ionicons name="settings-outline" size={22} color={projectColor} />
            </TouchableOpacity>
          )
        }} 
      />

      <Container>
        <View style={styles.header}>
          <View>
            <Text style={styles.sectionTitle}>Formulários</Text>
            <Text style={styles.sectionSubtitle}>Selecione para coletar dados</Text>
          </View>
          
          <TouchableOpacity 
            style={[styles.addButton, { backgroundColor: projectColor }]}
            onPress={() => router.push(`/(project)/new-form?projectId=${id}`)}
          >
            <Ionicons name="add" size={28} color="#FFF" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color={projectColor} style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={forms}
            keyExtractor={(item) => item.id}
            renderItem={renderFormItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[projectColor]} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="clipboard-outline" size={48} color={COLORS.border} />
                <Text style={styles.emptyText}>Nenhum formulário encontrado.</Text>
                <Text style={styles.emptySub}>Comece criando um formulário para este projeto.</Text>
              </View>
            }
          />
        )}
      </Container>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: COLORS.background },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 25
  },
  sectionTitle: { ...THEME.fonts.title, fontSize: 22, color: COLORS.textPrimary },
  sectionSubtitle: { ...THEME.fonts.subtitle, fontSize: 13, color: COLORS.textSecondary },
  
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  listContent: { paddingBottom: 30 },
  formCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  formInfo: { flex: 1 },
  formTitle: { ...THEME.fonts.body, fontSize: 16, color: COLORS.textPrimary },
  formMeta: { ...THEME.fonts.body, fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },

  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { ...THEME.fonts.body, color: COLORS.textPrimary, marginTop: 15 },
  emptySub: { ...THEME.fonts.body, color: COLORS.textSecondary, textAlign: 'center', marginTop: 5, paddingHorizontal: 40 }
});