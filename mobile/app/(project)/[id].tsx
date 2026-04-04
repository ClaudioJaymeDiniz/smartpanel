import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/src/styles/theme';
import { COLORS } from '@/src/styles/colors';
import Container from '@/src/components/common/Container';
import { api } from '@/src/services/api';
import { useAuth } from '@/src/store/AuthContext';
import { formService } from '@/src/services/formService';

interface FormItem {
  id: string;
  title: string;
  responses_count?: number;
  
}


export default function ProjectDetails() {
  //const cleanId = (id as string).replace(/\/$/, "");
  const { id, name } = useLocalSearchParams();
  const { isOffline } = useAuth();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forms, setForms] = useState<FormItem[]>([]);
  const [projectColor, setProjectColor] = useState(COLORS.primary);

const fetchProjectData = async () => {
  setLoading(true);
  try {
    if (isOffline) {
      const offlineForms = await formService.getProjectForms(id as string, true);
      setForms(offlineForms || []);
    } else {
      // Usamos try/catch individuais ou tratamos as respostas separadamente
      try {
        const formsRes = await api.get(`/forms/project/${id}`);
        setForms(Array.isArray(formsRes.data) ? formsRes.data : []);
      } catch (fErr: any) {
        console.error("Erro nos formulários:", fErr.error.message);
      }

      try {
        const projectRes = await api.get(`/projects/${id}`);
        if (projectRes.data?.themeColor) {
          setProjectColor(projectRes.data.themeColor);
        }
      } catch (pErr: any) {
        console.error("Erro no projeto (405?):", pErr.error.message);
        // Mantém a cor padrão se esta rota falhar
      }
    }
  } catch (error: any) {
    console.error("Erro Geral:", error.message);
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

  const renderFormItem = ({ item }: { item: FormItem }) => (
  <TouchableOpacity 
    style={styles.formCard}
    onPress={() => router.push(`/(form)/${item.id}`)}
    >
    <View style={[styles.iconBox, { backgroundColor: projectColor + '15' }]}>
      <Ionicons name="document-text" size={22} color={projectColor} />
    </View>
    <View style={styles.formInfo}>
      <Text style={styles.formTitle} numberOfLines={1}>{item.title}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <Text style={styles.formMeta}>{item.responses_count || 0} envios</Text>
        {/* Indicador visual de atividade */}
        {(item.responses_count || 0) > 0 && (
           <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.border }} />
        )}
        <Text style={styles.formMeta}>Criado em {new Date().toLocaleDateString('pt-BR')}</Text>
      </View>
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
            onPress={() => router.push(`/(form)/new?projectId=${id}`)}
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