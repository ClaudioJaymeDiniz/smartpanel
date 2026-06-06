// import React from 'react';
// import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { THEME } from '@/styles/theme';

// interface SubmissionCardProps {
//   submission: any;
//   currentUserId?: string;
//   isOwner: boolean;
//   isExpanded: boolean;
//   onToggleExpand: () => void;
//   onEditSubmission: (id: string) => void;
//   onSelectImage: (uri: string) => void;
// }

// export function SubmissionCard({
//   submission,
//   currentUserId,
//   isOwner,
//   isExpanded,
//   onToggleExpand,
//   onEditSubmission,
//   onSelectImage,
// }: SubmissionCardProps) {
//   const fields = Object.entries(submission.formData || {});
//   const isMine = submission.userId === currentUserId;

//   const isImageLikeValue = (key: string, value: any) => {
//     if (typeof value !== 'string') return false;
//     const v = value.trim().toLowerCase();
//     const keyLooksLikeImage = /image|imagem|foto|photo/.test(key.toLowerCase());
//     const urlLooksLikeImage = /\.(jpg|jpeg|png|webp|gif)(\?|$)/.test(v) || (v.includes('cloudinary.com') && v.includes('/image/upload/'));
//     return keyLooksLikeImage || urlLooksLikeImage;
//   };

//   const renderFieldValue = (key: string, value: any) => {
//     if (Array.isArray(value)) {
//       return <Text style={styles.fieldValue}>{value.map((item) => String(item)).join(', ')}</Text>;
//     }

//     if (value && typeof value === 'object') {
//       const maybeUri = (value as any).uri;
//       if (typeof maybeUri === 'string' && maybeUri.length > 0) {
//         return (
//           <TouchableOpacity style={styles.imageThumbRow} onPress={() => onSelectImage(maybeUri)} activeOpacity={0.85}>
//             <Image source={{ uri: maybeUri }} style={styles.imageThumb} />
//             <Text style={styles.imageThumbHint}>Toque para ampliar</Text>
//           </TouchableOpacity>
//         );
//       }
//       return <Text style={styles.fieldValue}>{JSON.stringify(value)}</Text>;
//     }

//     if (isImageLikeValue(key, value)) {
//       const imageUrl = String(value);
//       return (
//         <TouchableOpacity style={styles.imageThumbRow} onPress={() => onSelectImage(imageUrl)} activeOpacity={0.85}>
//           <Image source={{ uri: imageUrl }} style={styles.imageThumb} />
//           <Text style={styles.imageThumbHint}>Toque para ampliar</Text>
//         </TouchableOpacity>
//       );
//     }

//     return <Text style={styles.fieldValue}>{String(value ?? '')}</Text>;
//   };

//   return (
//     <View style={styles.card}>
//       <TouchableOpacity style={styles.cardHeaderButton} onPress={onToggleExpand}>
//         <View style={styles.cardHeader}>
//           <View style={styles.authorRow}>
//             <Ionicons name="person-circle-outline" size={18} color={THEME.colors.textSecondary} />
//             <Text style={styles.authorText}>
//               {submission.user?.name || submission.user?.email || (isMine ? 'Minha resposta' : 'Coletor')}
//             </Text>
//             <Ionicons name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'} size={18} color={THEME.colors.textSecondary} />
//           </View>
//         </View>
//         <Text style={styles.dateText}>{new Date(submission.createdAt).toLocaleString('pt-BR')}</Text>
//       </TouchableOpacity>

//       {isExpanded && (
//         <View style={styles.expandedContent}>
//           {fields.map(([key, value]) => (
//             <View key={`${submission.id}-${key}`} style={styles.fieldLine}>
//               <Text style={styles.fieldKey}>{key}:</Text>
//               {renderFieldValue(key, value)}
//             </View>
//           ))}

//           {fields.length === 0 && <Text style={styles.moreText}>Sem campos nesta resposta.</Text>}

//           {isMine && !isOwner && (
//             <TouchableOpacity style={styles.inlineEdit} onPress={() => onEditSubmission(submission.id)}>
//               <Ionicons name="create-outline" size={14} color={THEME.colors.primary} />
//               <Text style={styles.inlineEditText}>Editar esta resposta</Text>
//             </TouchableOpacity>
//           )}
//         </View>
//       )}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   card: { backgroundColor: THEME.colors.surface, borderColor: THEME.colors.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 10 },
//   cardHeaderButton: { paddingBottom: 4 },
//   cardHeader: { marginBottom: 8 },
//   expandedContent: { paddingTop: 2 },
//   authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
//   authorText: { color: THEME.colors.textPrimary, fontFamily: 'Jakarta-SemiBold', fontSize: 13, flex: 1 },
//   dateText: { marginTop: 2, fontSize: 12, color: THEME.colors.textSecondary },
//   fieldLine: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 6 },
//   fieldKey: { color: THEME.colors.textSecondary, fontSize: 12, fontFamily: 'Jakarta-SemiBold' },
//   fieldValue: { color: THEME.colors.textPrimary, fontSize: 13, flex: 1 },
//   imageThumbRow: { marginTop: 2, alignItems: 'flex-start' },
//   imageThumb: { width: 72, height: 72, borderRadius: 10, borderWidth: 1, borderColor: THEME.colors.border, backgroundColor: '#F3F4F6' },
//   imageThumbHint: { marginTop: 4, color: THEME.colors.textSecondary, fontSize: 11 },
//   moreText: { marginTop: 6, color: THEME.colors.textSecondary, fontSize: 12 },
//   inlineEdit: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
//   inlineEditText: { color: THEME.colors.primary, fontFamily: 'Jakarta-Bold', fontSize: 12 },
// });



import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

interface SubmissionCardProps {
  submission: any;
  currentUserId?: string;
  onPressDetails: () => void; // Nova prop de clique
}

export function SubmissionCard({ submission, currentUserId, onPressDetails }: SubmissionCardProps) {
  const isMine = submission.userId === currentUserId;

  return (
    <TouchableOpacity style={styles.card} onPress={onPressDetails} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.authorRow}>
          <Ionicons name="person-circle-outline" size={20} color={THEME.colors.textSecondary} />
          <View style={styles.infoCol}>
            <Text style={styles.authorText}>
              {submission.user?.name || submission.user?.email || (isMine ? 'Minha resposta' : 'Coletor')}
            </Text>
            <Text style={styles.dateText}>{new Date(submission.createdAt).toLocaleString('pt-BR')}</Text>
          </View>
          <Ionicons name="chevron-forward-outline" size={18} color={THEME.colors.textSecondary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: THEME.colors.surface, borderColor: THEME.colors.border, borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 10 },
  cardHeader: { flex: 1 },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  infoCol: { flex: 1, gap: 2 },
  authorText: { color: THEME.colors.textPrimary, fontFamily: 'Jakarta-SemiBold', fontSize: 14 },
  dateText: { fontSize: 12, color: THEME.colors.textSecondary },
});