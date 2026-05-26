import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Container from '@/components/common/Container';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { THEME } from '@/styles/theme';

type PublicFormItem = {
  id: string;
  title: string;
  description?: string;
  projectName?: string;
  projectColor?: string;
};

export default function Explore() {
  const router = useRouter();
  const formRepo = useMemo(() => new FormRepositoryImpl(), []);

  const [forms, setForms] = useState<PublicFormItem[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadForms = useCallback(async (options?: { silent?: boolean }) => {
    if (!options?.silent) setLoading(true);
    try {
      const data = await formRepo.getPublicForms();
      setForms(data);
    } catch (error) {
      console.error('Erro ao carregar formulários públicos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formRepo, refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadForms();
    }, [loadForms])
  );

  const filteredForms = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return forms;

    return forms.filter((form) => {
      return [form.title, form.description, form.projectName]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery));
    });
  }, [forms, query]);

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadForms({ silent: true });
            }}
            colors={[THEME.colors.primary]}
          />
        }
      >
        <Container>
          <View style={styles.hero}>
            <Text style={styles.kicker}>Explorar</Text>
            <Text style={styles.title}>Formulários públicos e compartilhados</Text>
            <Text style={styles.subtitle}>Descubra formulários abertos, navegue por projeto e responda com menos fricção.</Text>
          </View>

          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={20} color={THEME.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar por título, projeto ou descrição"
              placeholderTextColor={THEME.colors.textSecondary}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator color={THEME.colors.primary} size="large" />
            </View>
          ) : filteredForms.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="globe-outline" size={42} color={THEME.colors.border} />
              <Text style={styles.emptyTitle}>Nenhum formulário encontrado</Text>
              <Text style={styles.emptySubtitle}>Tente uma busca diferente ou volte mais tarde para ver novos formulários públicos.</Text>
            </View>
          ) : (
            filteredForms.map((form) => {
              const accent = form.projectColor || THEME.colors.primary;

              return (
                <TouchableOpacity
                  key={form.id}
                  style={styles.card}
                  onPress={() => router.push({ pathname: '/(form)/[id]', params: { id: form.id } })}
                >
                  <View style={[styles.icon, { backgroundColor: `${accent}15` }]}>
                    <Ionicons name="document-text-outline" size={20} color={accent} />
                  </View>

                  <View style={styles.cardBody}>
                    <Text style={styles.cardTitle} numberOfLines={1}>{form.title}</Text>
                    <Text style={styles.cardMeta} numberOfLines={1}>{form.projectName || 'Projeto público'}</Text>
                    {form.description ? <Text style={styles.cardDescription} numberOfLines={2}>{form.description}</Text> : null}
                  </View>

                  <Ionicons name="chevron-forward" size={18} color={THEME.colors.border} />
                </TouchableOpacity>
              );
            })
          )}
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.colors.background },
  content: { paddingTop: 14, paddingBottom: 24 },
  hero: {
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  kicker: { color: THEME.colors.primary, fontFamily: 'Manrope-SemiBold', textTransform: 'uppercase', fontSize: 12 },
  title: { marginTop: 6, fontSize: 22, color: THEME.colors.textPrimary, fontFamily: 'Jakarta-Bold' },
  subtitle: { marginTop: 8, color: THEME.colors.textSecondary, fontFamily: 'Manrope-Regular', lineHeight: 20 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    height: 52,
    borderRadius: 16,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 14,
  },
  searchInput: { flex: 1, color: THEME.colors.textPrimary, fontFamily: 'Manrope-Regular' },
  loadingWrap: { paddingVertical: 32 },
  emptyState: {
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderStyle: 'dashed',
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 18,
    alignItems: 'center',
  },
  emptyTitle: { marginTop: 10, fontFamily: 'Jakarta-Bold', fontSize: 16, color: THEME.colors.textPrimary },
  emptySubtitle: { marginTop: 6, textAlign: 'center', color: THEME.colors.textSecondary, lineHeight: 19, fontFamily: 'Manrope-Regular' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
  },
  icon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1 },
  cardTitle: { color: THEME.colors.textPrimary, fontFamily: 'Jakarta-Bold', fontSize: 15 },
  cardMeta: { marginTop: 2, color: THEME.colors.textSecondary, fontSize: 12, fontFamily: 'Manrope-Regular' },
  cardDescription: { marginTop: 5, color: THEME.colors.textSecondary, fontSize: 12, fontFamily: 'Manrope-Regular', lineHeight: 18 },
});