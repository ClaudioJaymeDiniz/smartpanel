import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
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
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';

export default function FormDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const formRepo = new FormRepositoryImpl();

  const {
    form,
    submissions,
    loading,
    refreshing,
    isOwner,
    isProjectArchived,
    isFormArchived,
    projectColor,
    mySubmission,
    setRefreshing,
    loadData,
  } = useFormDetails(id as string, user?.id);

  const accentColor = projectColor || THEME.colors.primary;
  const accentSoft = `${accentColor}10`;
  const accentBorder = `${accentColor}45`;

  useFocusEffect(
    useCallback(() => {
      loadData().catch(() => {
        Alert.alert('Erro', 'Nao foi possivel carregar o formulario.');
        router.back();
      });
    }, [loadData])
  );

  const openAnswerScreen = () => {
    if (isFormArchived) {
      Alert.alert('Formulario arquivado', 'Este formulario foi arquivado e nao aceita novas respostas.');
      return;
    }

    if (isProjectArchived) {
      Alert.alert('Projeto arquivado', 'Este projeto esta arquivado e nao pode receber respostas.');
      return;
    }

    router.push({
      pathname: '/(form)/answer/[id]',
      params: { id: id as string },
    });
  };

  const openEditMySubmission = () => {
    if (!mySubmission) return;

    if (isFormArchived) {
      Alert.alert('Formulario arquivado', 'Este formulario foi arquivado e nao pode ser editado.');
      return;
    }

    if (isProjectArchived) {
      Alert.alert('Projeto arquivado', 'Este projeto esta arquivado e nao pode receber respostas.');
      return;
    }

    router.push({
      pathname: '/(form)/answer/[id]',
      params: { id: id as string, submissionId: mySubmission.id },
    });
  };

  const openEditSubmission = (submissionId: string) => {
    if (isFormArchived) {
      Alert.alert('Formulario arquivado', 'Este formulario foi arquivado e nao pode ser editado.');
      return;
    }

    if (isProjectArchived) {
      Alert.alert('Projeto arquivado', 'Este projeto esta arquivado e nao pode receber respostas.');
      return;
    }

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

  const handleExportCsv = async () => {
    try {
      const fileUri = await formRepo.downloadResponsesCsv(id as string);
      Alert.alert('CSV baixado', `Arquivo salvo em:\n${fileUri}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel baixar o CSV.';
      Alert.alert('Erro ao exportar', message);
    }
  };

  const handleArchiveForm = () => {
    Alert.alert(
      'Arquivar formulário?',
      'O formulário vai para a lixeira e só poderá ser excluído definitivamente depois disso.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Arquivar',
          style: 'destructive',
          onPress: async () => {
            try {
              await formRepo.archive(id as string);
              await loadData();
              Alert.alert('Sucesso', 'Formulario arquivado com sucesso.');
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Nao foi possivel arquivar o formulario.';
              Alert.alert('Erro', message);
            }
          },
        },
      ]
    );
  };

  const handleRestoreForm = async () => {
    try {
      await formRepo.restore(id as string);
      await loadData();
      Alert.alert('Sucesso', 'Formulario restaurado com sucesso.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Nao foi possivel restaurar o formulario.';
      Alert.alert('Erro', message);
    }
  };

  const handlePermanentDelete = () => {
    Alert.alert(
      'Excluir definitivamente?',
      'Essa acao nao pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await formRepo.permanentDelete(id as string);
              Alert.alert('Sucesso', 'Formulario excluido definitivamente.');
              router.back();
            } catch (error) {
              const message = error instanceof Error ? error.message : 'Nao foi possivel excluir o formulario.';
              Alert.alert('Erro', message);
            }
          },
        },
      ]
    );
  };

  const goBack = () => {
    router.back();
  };

  const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const toggleExpanded = (submissionId: string) => {
    setExpandedSubmissionId((prev) => (prev === submissionId ? null : submissionId));
  };

  const isImageLikeValue = (key: string, value: any) => {
    if (typeof value !== 'string') return false;

    const v = value.trim().toLowerCase();
    const keyLooksLikeImage = /image|imagem|foto|photo/.test(key.toLowerCase());
    const urlLooksLikeImage =
      /\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(v) ||
      (v.includes('cloudinary.com') && v.includes('/image/upload/'));

    return keyLooksLikeImage || urlLooksLikeImage;
  };

  const renderFieldValue = (key: string, value: any, submissionId: string) => {
    if (Array.isArray(value)) {
      return <Text style={styles.fieldValue}>{value.map((item) => String(item)).join(', ')}</Text>;
    }

    if (value && typeof value === 'object') {
      const maybeUri = (value as any).uri;
      if (typeof maybeUri === 'string' && maybeUri.length > 0) {
        return (
          <TouchableOpacity
            style={styles.imageThumbRow}
            onPress={() => setPreviewImage(maybeUri)}
            activeOpacity={0.85}
          >
            <Image source={{ uri: maybeUri }} style={styles.imageThumb} />
            <Text style={styles.imageThumbHint}>Toque para ampliar</Text>
          </TouchableOpacity>
        );
      }

      return <Text style={styles.fieldValue}>{JSON.stringify(value)}</Text>;
    }

    if (isImageLikeValue(key, value)) {
      const imageUrl = String(value);
      return (
        <TouchableOpacity
          style={styles.imageThumbRow}
          onPress={() => setPreviewImage(imageUrl)}
          activeOpacity={0.85}
        >
          <Image source={{ uri: imageUrl }} style={styles.imageThumb} />
          <Text style={styles.imageThumbHint}>Toque para ampliar</Text>
        </TouchableOpacity>
      );
    }

    return <Text style={styles.fieldValue}>{String(value ?? '')}</Text>;
  };

  const orderedSubmissions = useMemo(() => submissions, [submissions]);

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: form?.title || 'Respostas do Formulario',
          headerTintColor: accentColor,
        }}
      />

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
          <TouchableOpacity style={styles.backButton} onPress={goBack} accessibilityLabel="Voltar página">
            <Ionicons name="arrow-back" size={22} color={accentColor} />
          </TouchableOpacity>

          <Text style={styles.title}>{form?.title}</Text>
          <Text style={styles.description}>{form?.description || 'Visualize as respostas enviadas.'}</Text>

          {isOwner && isFormArchived ? (
            <View style={[styles.archivedBanner, { backgroundColor: accentSoft, borderColor: accentBorder }]}>
              <Ionicons name="archive-outline" size={18} color="#64748B" />
              <Text style={styles.archivedBannerText}>Formulario arquivado</Text>
            </View>
          ) : null}

          <View style={styles.actionsRow}>
            {isOwner ? (
              <View style={styles.ownerActions}>
                {!isFormArchived ? (
                  <>
                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={openEditForm}>
                      <Ionicons name="build-outline" size={16} color={accentColor} />
                      <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Editar formulario</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={handleExportCsv}>
                      <Ionicons name="download-outline" size={16} color={accentColor} />
                      <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Baixar CSV</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={handleArchiveForm}>
                      <Ionicons name="archive-outline" size={16} color={accentColor} />
                      <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Arquivar formulario</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity style={[styles.secondaryButton, { backgroundColor: accentSoft, borderColor: accentBorder }]} onPress={handleRestoreForm}>
                      <Ionicons name="arrow-undo-outline" size={16} color={accentColor} />
                      <Text style={[styles.secondaryButtonText, { color: accentColor }]}>Restaurar formulario</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.dangerButton} onPress={handlePermanentDelete}>
                      <Ionicons name="trash-outline" size={16} color="#EF4444" />
                      <Text style={styles.dangerButtonText}>Excluir definitivamente</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <TouchableOpacity style={[styles.primaryButton, (isProjectArchived || isFormArchived) && styles.disabledButton]} onPress={openAnswerScreen} disabled={isProjectArchived || isFormArchived}>
                <Ionicons name="paper-plane-outline" size={16} color="#FFF" />
                <Text style={styles.primaryButtonText}>
                  {isFormArchived ? 'Formulario arquivado' : isProjectArchived ? 'Projeto arquivado' : 'Responder formulario'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.sectionTitle}>Respostas ({submissions.length})</Text>

          {orderedSubmissions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={42} color={THEME.colors.border} />
              <Text style={styles.emptyTitle}>Nenhuma resposta ainda</Text>
              <Text style={styles.emptySubtitle}>As respostas enviadas aparecerao aqui.</Text>
            </View>
          ) : (
            orderedSubmissions.map((submission) => {
              const fields = Object.entries(submission.formData || {});
              const isMine = submission.userId === user?.id;
              const isExpanded = expandedSubmissionId === submission.id;

              return (
                <View key={submission.id} style={styles.card}>
                  <TouchableOpacity style={styles.cardHeaderButton} onPress={() => toggleExpanded(submission.id)}>
                    <View style={styles.cardHeader}>
                      <View style={styles.authorRow}>
                        <Ionicons name="person-circle-outline" size={18} color={THEME.colors.textSecondary} />
                        <Text style={styles.authorText}>
                          {submission.user?.name || submission.user?.email || (isMine ? 'Minha resposta' : 'Coletor')}
                        </Text>
                        <Ionicons
                          name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}
                          size={18}
                          color={THEME.colors.textSecondary}
                        />
                      </View>
                    </View>
                    <Text style={styles.dateText}>{new Date(submission.createdAt).toLocaleString('pt-BR')}</Text>
                  </TouchableOpacity>

                  {isExpanded ? (
                    <View style={styles.expandedContent}>
                      {fields.map(([key, value]) => (
                        <View key={`${submission.id}-${key}`} style={styles.fieldLine}>
                          <Text style={styles.fieldKey}>{key}:</Text>
                          {renderFieldValue(key, value, submission.id)}
                        </View>
                      ))}

                      {fields.length === 0 ? <Text style={styles.moreText}>Sem campos nesta resposta.</Text> : null}

                      {isMine && !isOwner && (
                        <TouchableOpacity style={styles.inlineEdit} onPress={() => openEditSubmission(submission.id)}>
                          <Ionicons name="create-outline" size={14} color={THEME.colors.primary} />
                          <Text style={styles.inlineEditText}>Editar esta resposta</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ) : null}
                </View>
              );
            })
          )}
        </Container>
      </ScrollView>

      <Modal visible={Boolean(previewImage)} transparent animationType="fade" onRequestClose={() => setPreviewImage(null)}>
        <Pressable style={styles.previewBackdrop} onPress={() => setPreviewImage(null)}>
          {previewImage ? (
            <Image source={{ uri: previewImage }} style={styles.previewImage} resizeMode="contain" />
          ) : null}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: THEME.colors.background },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background },
  scroll: { paddingVertical: 20 },
  title: { fontSize: 24, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  description: { marginTop: 6, marginBottom: 18, color: THEME.colors.textSecondary, fontSize: 14 },
  backButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: `${THEME.colors.primary}12`,
    marginBottom: 12,
  },
  actionsRow: { marginBottom: 16 },
  ownerActions: { gap: 10 },
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
  disabledButton: {
    opacity: 0.6,
  },
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
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    height: 48,
    borderRadius: 14,
  },
  dangerButtonText: { color: '#DC2626', fontFamily: 'Jakarta-Bold', fontSize: 14 },
  archivedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 14,
  },
  archivedBannerText: { color: '#475569', fontFamily: 'Jakarta-SemiBold', fontSize: 13 },
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
  cardHeaderButton: { paddingBottom: 4 },
  cardHeader: { marginBottom: 8 },
  expandedContent: { paddingTop: 2 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
  imageThumbRow: { marginTop: 2, alignItems: 'flex-start' },
  imageThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: '#F3F4F6',
  },
  imageThumbHint: {
    marginTop: 4,
    color: THEME.colors.textSecondary,
    fontSize: 11,
  },
  authorText: { color: THEME.colors.textPrimary, fontFamily: 'Jakarta-SemiBold', fontSize: 13 },
  dateText: { marginTop: 2, fontSize: 12, color: THEME.colors.textSecondary },
  fieldLine: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
  fieldKey: { color: THEME.colors.textSecondary, fontSize: 12, fontFamily: 'Jakarta-SemiBold' },
  fieldValue: { color: THEME.colors.textPrimary, fontSize: 13, flex: 1 },
  moreText: { marginTop: 6, color: THEME.colors.textSecondary, fontSize: 12 },
  inlineEdit: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  inlineEditText: { color: THEME.colors.primary, fontFamily: 'Jakarta-Bold', fontSize: 12 },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: '80%',
    borderRadius: 12,
  },
});
