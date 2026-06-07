// import React, { useCallback, useState } from 'react';
// import { ActivityIndicator, Alert, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
// import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';

// import { THEME } from '@/styles/theme';
// import Container from '@/components/common/Container';
// import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
// import { useFormDetails } from '@/presentation/forms/hooks/useFormDetails';
// import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';


// import { FormHeader } from '@/components/forms/FormHeader';
// import { FormActions } from '@/components/forms/FormActions';
// import { SubmissionCard } from '@/components/forms/SubmissionCard';
// import { ImagePreviewModal } from '@/components/forms/ImagePreviewModal';

// export default function FormDetails() {
//   const { id } = useLocalSearchParams();
//   const router = useRouter();
//   const { user } = useAuthStore();
//   const formRepo = new FormRepositoryImpl();

//   const {
//     form,
//     submissions,
//     loading,
//     refreshing,
//     isOwner,
//     isProjectArchived,
//     isFormArchived,
//     projectColor,
//     mySubmission,
//     setRefreshing,
//     loadData,
//   } = useFormDetails(id as string, user?.id);

//   const [expandedSubmissionId, setExpandedSubmissionId] = useState<string | null>(null);
//   const [previewImage, setPreviewImage] = useState<string | null>(null);

//   const accentColor = projectColor || THEME.colors.primary;
//   const accentSoft = `${accentColor}10`;
//   const accentBorder = `${accentColor}45`;

//   useFocusEffect(
//     useCallback(() => {
//       loadData().catch(() => {
//         Alert.alert('Erro', 'Não foi possível carregar o formulário.');
//         router.back();
//       });
//     }, [loadData])
//   );


//   // Handlers de Ações (Redirecionamento / Repositório)
//   const openAnswerScreen = () => {
//     if (isFormArchived || isProjectArchived) {
//       Alert.alert('Bloqueado', 'Formulário ou projeto arquivado.');
//       return;
//     }
//     router.push({ pathname: '/(form)/answer/[id]', params: { id: id as string } });
//   };

//   const openEditSubmission = (submissionId: string) => {
//     if (isFormArchived || isProjectArchived) {
//       Alert.alert('Bloqueado', 'Formulário ou projeto arquivado.');
//       return;
//     }
//     router.push({ pathname: '/(form)/answer/[id]', params: { id: id as string, submissionId } });
//   };

//   const handleExportCsv = async () => {
//     try {
//       const fileUri = await formRepo.downloadResponsesCsv(id as string);
//       Alert.alert('CSV baixado', `Arquivo salvo em:\n${fileUri}`);
//     } catch (error) {
//       Alert.alert('Erro ao exportar', 'Não foi possível baixar o CSV.');
//     }
//   };

//   const handleArchiveForm = () => {
//     Alert.alert('Arquivar?', 'O formulário vai para a lixeira.', [
//       { text: 'Cancelar', style: 'cancel' },
//       { text: 'Arquivar', style: 'destructive', onPress: async () => {
//           await formRepo.archive(id as string);
//           await loadData();
//         } 
//       }
//     ]);
//   };

//   const handleRestoreForm = async () => {
//     await formRepo.restore(id as string);
//     await loadData();
//   };

//   const handlePermanentDelete = () => {
//     Alert.alert('Excluir definitivamente?', 'Essa ação não pode ser desfeita.', [
//       { text: 'Cancelar', style: 'cancel' },
//       { text: 'Excluir', style: 'destructive', onPress: async () => {
//           await formRepo.permanentDelete(id as string);
//           router.back();
//         }
//       }
//     ]);
//   };

//   if (loading && !refreshing) {
//     return (
//       <View style={styles.centered}>
//         <ActivityIndicator size="large" color={THEME.colors.primary} />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.screen}>
//       <Stack.Screen options={{ title: form?.title || 'Respostas', headerTintColor: accentColor }} />

//       <ScrollView
//         contentContainerStyle={styles.scroll}
//         refreshControl={
//           <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[THEME.colors.primary]} />
//         }
//       >
//         <Container>
//           <FormHeader
//             title={form?.title}
//             description={form?.description}
//             totalCount={form?.submissionCount ?? submissions.length}
//             visibleCount={submissions.length}
//             isOwner={isOwner}
//             isFormArchived={isFormArchived}
//             accentColor={accentColor}
//             accentSoft={accentSoft}
//             accentBorder={accentBorder}
//             onBack={() => router.back()}
//           />

//           <View style={styles.actionsRow}>
//             <FormActions
//               isOwner={isOwner}
//               isFormArchived={isFormArchived}
//               isProjectArchived={isProjectArchived}
//               accentColor={accentColor}
//               accentSoft={accentSoft}
//               accentBorder={accentBorder}
//               onEditForm={() => router.push({ pathname: '/(form)/edit', params: { id: id as string } })}
//               onAnalytics={() => router.push({ pathname: '/(dashboard)/[formularioId]/analitics', params: { formularioId: id } })}
//               onExportCsv={handleExportCsv}
//               onArchiveForm={handleArchiveForm}
//               onRestoreForm={handleRestoreForm}
//               onPermanentDelete={handlePermanentDelete}
//               onAnswerScreen={openAnswerScreen}
//             />
//           </View>

//           <Text style={styles.sectionTitle}>Respostas visíveis ({submissions.length})</Text>

//           {submissions.length === 0 ? (
//             <View style={styles.emptyState}>
//               <Ionicons name="document-text-outline" size={42} color={THEME.colors.border} />
//               <Text style={styles.emptyTitle}>{isOwner ? 'Nenhuma resposta ainda' : 'Nenhuma resposta visível'}</Text>
//             </View>
//           ) : (
//             submissions.map((submission) => (
//               <SubmissionCard
//                 key={submission.id}
//                 submission={submission}
//                 currentUserId={user?.id}
//                 isOwner={isOwner}
//                 isExpanded={expandedSubmissionId === submission.id}
//                 onToggleExpand={() => setExpandedSubmissionId(prev => prev === submission.id ? null : submission.id)}
//                 onEditSubmission={openEditSubmission}
//                 onSelectImage={(uri) => setPreviewImage(uri)}
//               />
//             ))
//           )}
//         </Container>
//       </ScrollView>

//       <ImagePreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   screen: { flex: 1, backgroundColor: THEME.colors.background },
//   centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background },
//   scroll: { paddingVertical: 20 },
//   actionsRow: { marginBottom: 16 },
//   sectionTitle: { marginTop: 6, marginBottom: 10, fontSize: 16, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
//   emptyState: { marginTop: 10, borderRadius: 16, borderWidth: 1, borderColor: THEME.colors.border, backgroundColor: THEME.colors.surface, padding: 24, alignItems: 'center' },
//   emptyTitle: { marginTop: 10, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary, fontSize: 15 },
// });




import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Stack, useFocusEffect, useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';
import { useFormDetails } from '@/presentation/forms/hooks/useFormDetails';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';


import { FormHeader } from '@/components/forms/FormHeader';
import { FormActions } from '@/components/forms/FormActions';
import { SubmissionCard } from '@/components/forms/SubmissionCard';
import { ImagePreviewModal } from '@/components/forms/ImagePreviewModal';
import { SubmissionDetailsModal } from '@/components/forms/SubmissionDetailsModal';

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
    setRefreshing,
    loadData,
  } = useFormDetails(id as string, user?.id);

  // Estados para gerenciar os Modais
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const accentColor = projectColor || THEME.colors.primary;
  const accentSoft = `${accentColor}10`;
  const accentBorder = `${accentColor}45`;

  useFocusEffect(
    useCallback(() => {
      loadData().catch(() => {
        Alert.alert('Erro', 'Não foi possível carregar o formulário.');
        router.back();
      });
    }, [loadData])
  );

  // Lógica de detecção de imagem (reaproveitada para o modal de detalhes)
  const isImageLikeValue = (key: string, value: any) => {
    if (typeof value !== 'string') return false;
    const v = value.trim().toLowerCase();
    const keyLooksLikeImage = /image|imagem|foto|photo/.test(key.toLowerCase());
    const urlLooksLikeImage = /\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(v) || (v.includes('cloudinary.com') && v.includes('/image/upload/'));
    return keyLooksLikeImage || urlLooksLikeImage;
  };

  // Função injetada no modal para renderizar textos, arrays ou fotos com zoom
  const renderFieldValue = (key: string, value: any) => {
    if (Array.isArray(value)) {
      return <Text style={styles.fieldValue}>{value.map((item) => String(item)).join(', ')}</Text>;
    }

    if (value && typeof value === 'object') {
      const maybeUri = (value as any).uri;
      if (typeof maybeUri === 'string' && maybeUri.length > 0) {
        return (
          <TouchableOpacity style={styles.imageThumbRow} onPress={() => setPreviewImage(maybeUri)} activeOpacity={0.85}>
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
        <TouchableOpacity style={styles.imageThumbRow} onPress={() => setPreviewImage(imageUrl)} activeOpacity={0.85}>
          <Image source={{ uri: imageUrl }} style={styles.imageThumb} />
          <Text style={styles.imageThumbHint}>Toque para ampliar</Text>
        </TouchableOpacity>
      );
    }

    return <Text style={styles.fieldValue}>{String(value ?? '')}</Text>;
  };

  // Handlers de Ações
  const openAnswerScreen = () => {
    if (isFormArchived || isProjectArchived) {
      Alert.alert('Bloqueado', 'Formulário ou projeto arquivado.');
      return;
    }
    router.push({ pathname: '/(form)/answer/[id]', params: { id: id as string } });
  };

  const handleExportCsv = async () => {
    try {
      const fileUri = await formRepo.downloadResponsesCsv(id as string);
      Alert.alert('CSV baixado', `Arquivo salvo em:\n${fileUri}`);
    } catch (error) {
      Alert.alert('Erro ao exportar', 'Não foi possível baixar o CSV.');
    }
  };

  const handleArchiveForm = () => {
    Alert.alert('Arquivar formulário?', 'O formulário vai para a lixeira.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Arquivar', style: 'destructive', onPress: async () => {
          await formRepo.archive(id as string);
          await loadData();
        } 
      }
    ]);
  };

  const handleRestoreForm = async () => {
    await formRepo.restore(id as string);
    await loadData();
  };

  const handlePermanentDelete = () => {
    Alert.alert('Excluir definitivamente?', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: async () => {
          await formRepo.permanentDelete(id as string);
          router.back();
        }
      }
    ]);
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
      <Stack.Screen options={{ title: form?.title || 'Respostas', headerTintColor: accentColor }} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadData(); }} colors={[THEME.colors.primary]} />
        }
      >
        <Container>
          <FormHeader
            title={form?.title}
            description={form?.description}
            totalCount={form?.submissionCount ?? submissions.length}
            visibleCount={submissions.length}
            isOwner={isOwner}
            isFormArchived={isFormArchived}
            accentColor={accentColor}
            accentSoft={accentSoft}
            accentBorder={accentBorder}
            //onBack={() => router.back()}
          />

          <View style={styles.actionsRow}>
            <FormActions
              isOwner={isOwner}
              isFormArchived={isFormArchived}
              isProjectArchived={isProjectArchived}
              accentColor={accentColor}
              accentSoft={accentSoft}
              accentBorder={accentBorder}
              onEditForm={() => router.push({ pathname: '/(form)/edit', params: { id: id as string } })}
              onAnalytics={() => router.push({ pathname: '/(dashboard)/[formularioId]/analitics', params: { formularioId: id as string } })}
              onExportCsv={handleExportCsv}
              onArchiveForm={handleArchiveForm}
              onRestoreForm={handleRestoreForm}
              onPermanentDelete={handlePermanentDelete}
              onAnswerScreen={openAnswerScreen}
            />
          </View>

          <Text style={styles.sectionTitle}>Respostas visíveis ({submissions.length})</Text>

          {submissions.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="document-text-outline" size={42} color={THEME.colors.border} />
              <Text style={styles.emptyTitle}>{isOwner ? 'Nenhuma resposta ainda' : 'Nenhuma resposta visível'}</Text>
            </View>
          ) : (
            submissions.map((submission) => (
              <SubmissionCard
                key={submission.id}
                submission={submission}
                currentUserId={user?.id}
                onPressDetails={() => setSelectedSubmission(submission)}
              />
            ))
          )}
        </Container>
      </ScrollView>

      {/* Modal 1: Ficha completa com todas as perguntas/respostas */}
      <SubmissionDetailsModal
        submission={selectedSubmission}
        formFields={form?.fields}
        onClose={() => setSelectedSubmission(null)}
        renderFieldValue={renderFieldValue}
      />

      {/* Modal 2: Zoom de imagem caso cliquem em alguma foto de dentro dos detalhes */}
      <ImagePreviewModal imageUrl={previewImage} onClose={() => setPreviewImage(null)} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, 
    backgroundColor: THEME.colors.background },
  centered: { flex: 1, justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: THEME.colors.background },
  scroll: { paddingVertical: 20 },
  actionsRow: { marginBottom: 16 },
  sectionTitle: { marginTop: 6, marginBottom: 10, fontSize: 16, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  emptyState: { marginTop: 10, borderRadius: 16, borderWidth: 1, borderColor: THEME.colors.border, backgroundColor: THEME.colors.surface, padding: 24, alignItems: 'center' },
  emptyTitle: { marginTop: 10, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary, fontSize: 15 },
  fieldValue: { color: THEME.colors.textPrimary, fontSize: 14, marginBottom: 8 },
  imageThumbRow: { marginTop: 8, alignItems: 'center' },
  imageThumb: { width: 140, height: 100, borderRadius: 8, resizeMode: 'cover', backgroundColor: THEME.colors.border },
  imageThumbHint: { marginTop: 6, fontSize: 12, color: THEME.colors.textSecondary },
});