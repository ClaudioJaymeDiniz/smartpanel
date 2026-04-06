import React, { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useFormDetails } from '@/presentation/forms/hooks/useFormDetails';

export default function FormDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();

  const {
    form,
    submissions,
    loading,
    refreshing,
    isOwner,
    mySubmission,
    setRefreshing,
    loadData,
  } = useFormDetails(id as string, user?.id);

  useFocusEffect(
    useCallback(() => {
      loadData().catch(() => {
        Alert.alert('Erro', 'Nao foi possivel carregar o formulario.');
        router.back();
      });
    }, [loadData])
  );

  const openAnswerScreen = () => {
    router.push({
      pathname: '/(form)/answer/[id]',
      params: { id: id as string },
    });
  };

  const openEditMySubmission = () => {
    if (!mySubmission) return;

    router.push({
      pathname: '/(form)/answer/[id]',
      params: { id: id as string, submissionId: mySubmission.id },
    });
  };

  const openEditSubmission = (submissionId: string) => {
    router.push({
      pathname: '/(form)/answer/[id]',
      params: { id: id as string, submissionId },
    });
  };

  const openEditForm = () => {
    router.push({
      pathname: '/(form)/edit',
      params: { id: id as string },
    });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: form?.title || 'Respostas do Formulario' }} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            colors={[THEME.colors.primary]}
          />
        }
      >
        <Container>
          <Text style={styles.title}>{form?.title}</Text>
          <Text style={styles.description}>{form?.description || 'Visualize as respostas enviadas.'}</Text>

          <View style={styles.actionsRow}>
            {isOwner ? (
              <TouchableOpacity style={styles.secondaryButton} onPress={openEditForm}>
                <Ionicons name="build-outline" size={16} color={THEME.colors.primary} />
                <Text style={styles.secondaryButtonText}>Editar formulario</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.primaryButton} onPress={openAnswerScreen}>
                <Ionicons name="paper-plane-outline" size={16} color="#FFF" />
                <Text style={styles.primaryButtonText}>Responder formulario</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>Respostas ({submissions.length})</Text>

          {submissions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={42} color={THEME.colors.border} />
              <Text style={styles.emptyTitle}>Nenhuma resposta ainda</Text>
              <Text style={styles.emptySubtitle}>As respostas enviadas aparecerao aqui.</Text>
            </View>
          ) : (
            submissions.map((submission) => {
              const fieldsPreview = Object.entries(submission.formData || {}).slice(0, 3);
              const isMine = submission.userId === user?.id;

              return (
                <View key={submission.id} style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={styles.authorRow}>
                      <Ionicons name="person-circle-outline" size={18} color={THEME.colors.textSecondary} />
                      <Text style={styles.authorText}>
                        {submission.user?.name || submission.user?.email || (isMine ? 'Minha resposta' : 'Coletor')}
                      </Text>
                    </View>
                    <Text style={styles.dateText}>{new Date(submission.createdAt).toLocaleString('pt-BR')}</Text>
                  </View>

                  {fieldsPreview.map(([key, value]) => (
                    <View key={`${submission.id}-${key}`} style={styles.fieldLine}>
                      <Text style={styles.fieldKey}>{key}:</Text>
                      <Text style={styles.fieldValue}>{String(value)}</Text>
                    </View>
                  ))}

                  {Object.keys(submission.formData || {}).length > 3 && (
                    <Text style={styles.moreText}>...e mais campos</Text>
                  )}

                  {isMine && !isOwner && (
                    <TouchableOpacity style={styles.inlineEdit} onPress={() => openEditSubmission(submission.id)}>
                      <Ionicons name="create-outline" size={14} color={THEME.colors.primary} />
                      <Text style={styles.inlineEditText}>Editar esta resposta</Text>
                    </TouchableOpacity>
                  )}
                </View>
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
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background },
  scroll: { paddingVertical: 20 },
  title: { fontSize: 24, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  description: { marginTop: 6, marginBottom: 18, color: THEME.colors.textSecondary, fontSize: 14 },
  actionsRow: { marginBottom: 16 },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: THEME.colors.primary,
    height: 48,
    borderRadius: 14,
  },
  primaryButtonText: { color: '#FFF', fontFamily: 'Jakarta-Bold', fontSize: 14 },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: `${THEME.colors.primary}10`,
    borderColor: `${THEME.colors.primary}45`,
    borderWidth: 1,
    height: 48,
    borderRadius: 14,
  },
  secondaryButtonText: { color: THEME.colors.primary, fontFamily: 'Jakarta-Bold', fontSize: 14 },
  sectionTitle: { marginTop: 6, marginBottom: 10, fontSize: 16, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  emptyState: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: { marginTop: 10, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary, fontSize: 15 },
  emptySubtitle: { marginTop: 4, color: THEME.colors.textSecondary, textAlign: 'center' },
  card: {
    backgroundColor: THEME.colors.surface,
    borderColor: THEME.colors.border,
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  cardHeader: { marginBottom: 8 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorText: { color: THEME.colors.textPrimary, fontFamily: 'Jakarta-SemiBold', fontSize: 13 },
  dateText: { marginTop: 2, fontSize: 12, color: THEME.colors.textSecondary },
  fieldLine: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  fieldKey: { color: THEME.colors.textSecondary, fontSize: 12, fontFamily: 'Jakarta-SemiBold' },
  fieldValue: { color: THEME.colors.textPrimary, fontSize: 13, flex: 1 },
  moreText: { marginTop: 6, color: THEME.colors.textSecondary, fontSize: 12 },
  inlineEdit: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  inlineEditText: { color: THEME.colors.primary, fontFamily: 'Jakarta-Bold', fontSize: 12 },
});
