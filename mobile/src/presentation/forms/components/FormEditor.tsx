// import React from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
// import { Ionicons } from '@expo/vector-icons';
// import { THEME } from '@/styles/theme';
// import CustomInput from '@/components/common/CustomInput';
// import { FieldType, FormField } from '@/core/forms/domain/entities/Form';

// interface FormEditorProps {
//   title: string;
//   setTitle: (t: string) => void;
//   description: string;
//   setDescription: (d: string) => void;
//   fields: FormField[];
//   setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
//   accentColor?: string;
// }

// export default function FormEditor({ 
//   title, setTitle, description, setDescription, fields, setFields, accentColor = THEME.colors.primary
// }: FormEditorProps) {

//   const addField = () => {
//     setFields([...fields, { label: '', type: 'text', required: true }]);
//   };

//   const removeField = (index: number) => {
//     setFields(fields.filter((_, i) => i !== index));
//   };

//   const updateField = (index: number, key: keyof FormField, value: any) => {
//     const newFields = [...fields];
//     newFields[index] = { ...newFields[index], [key]: value };
//     if (key === 'type' && value !== 'select' && value !== 'checkbox') {
//       delete newFields[index].options;
//     }
//     setFields(newFields);
//   };

//   return (
//     <View>
//       {/* Cabeçalho do Forms */}
//       <CustomInput label="Título do Formulário" value={title} onChangeText={setTitle} accentColor={accentColor} />
//       <CustomInput label="Descrição" value={description} onChangeText={setDescription} accentColor={accentColor} />

//       <View style={styles.divider}>
//         <Text style={styles.sectionTitle}>QUESTÕES</Text>
//         <View style={styles.line} />
//       </View>

//       {/* Lista de Campos */}
//       {fields.map((field, index) => (
//         <View key={index} style={styles.fieldCard}>
//           <View style={styles.fieldHeader}>
//             <Text style={[styles.fieldIndex, { color: accentColor }]}>CAMPO {index + 1}</Text>
//             <TouchableOpacity onPress={() => removeField(index)}>
//               <Ionicons name="trash-outline" size={18} color={THEME.colors.error} />
//             </TouchableOpacity>
//           </View>

//               <CustomInput
//                 label="Pergunta"
//                 value={field.label}
//                 onChangeText={(text) => updateField(index, 'label', text)}
//                 accentColor={accentColor}
//               />

//           <Text style={styles.smallLabel}>Tipo de Resposta:</Text>
//           <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeRow}>
//             {(['text', 'textarea', 'number', 'select', 'checkbox', 'image'] as FieldType[]).map((t) => (
//               <TouchableOpacity 
//                 key={t} 
//                 onPress={() => updateField(index, 'type', t)}
//                 style={[
//                   styles.typeBadge,
//                   field.type === t && { backgroundColor: accentColor }
//                 ]}
//               >
//                 <Text style={[styles.typeText, field.type === t && styles.typeTextActive]}>{t.toUpperCase()}</Text>
//               </TouchableOpacity>
//             ))}
//           </ScrollView>

//           <View style={styles.requiredRow}>
//             <Text style={styles.requiredLabel}>Resposta obrigatoria</Text>
//             <Switch
//               value={field.required}
//               onValueChange={(v) => updateField(index, 'required', v)}
//               trackColor={{ true: `${accentColor}88` }}
//               thumbColor={field.required ? accentColor : '#f4f4f5'}
//             />
//           </View>

//           {/* Configuração de Opções */}
//           {(field.type === 'select' || field.type === 'checkbox') && (
//             <View style={styles.optionsArea}>
//               <CustomInput
//                   label="Opções (separe por vírgula)"
//                   value={field.options?.join(', ') || ''}
//                   onChangeText={(text) => updateField(index, 'options', text.split(',').map(s => s.trim()))}
//                   accentColor={accentColor}
//                 />
//             </View>
//           )}
//         </View>
//       ))}

//       <TouchableOpacity style={[styles.addBtn, { borderColor: accentColor }]} onPress={addField}>
//         <Ionicons name="add-circle-outline" size={22} color={accentColor} />
//         <Text style={[styles.addBtnText, { color: accentColor }]}>Adicionar Pergunta</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
//   sectionTitle: { fontSize: 10, fontFamily: 'Jakarta-Bold', color: THEME.colors.textSecondary },
//   line: { flex: 1, height: 1, backgroundColor: THEME.colors.border },
//   fieldCard: { backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.colors.border },
//   fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
//   fieldIndex: { fontSize: 9, color: THEME.colors.primary, fontFamily: 'Jakarta-Bold' },
//   smallLabel: { fontSize: 10, color: THEME.colors.textSecondary, marginBottom: 5, marginTop: 10 },
//   typeRow: { flexDirection: 'row' },
//   typeBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#F1F5F9', marginRight: 8 },
//   typeBadgeActive: { backgroundColor: THEME.colors.primary },
//   typeText: { fontSize: 10, fontFamily: 'Jakarta-Bold', color: THEME.colors.textSecondary },
//   typeTextActive: { color: '#FFF' },
//   requiredRow: {
//     marginTop: 12,
//     paddingTop: 10,
//     borderTopWidth: 1,
//     borderTopColor: THEME.colors.border,
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   requiredLabel: { fontSize: 12, color: THEME.colors.textSecondary, fontFamily: 'Jakarta-SemiBold' },
//   optionsArea: { marginTop: 10, borderTopWidth: 1, borderTopColor: THEME.colors.border },
//   addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderWidth: 1, borderColor: THEME.colors.primary, borderStyle: 'dashed', borderRadius: 12 },
//   addBtnText: { marginLeft: 8, color: THEME.colors.primary, fontFamily: 'Jakarta-Bold', fontSize: 14 }
// });


import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';
import CustomInput from '@/components/common/CustomInput';
import { FieldType, FormField } from '@/core/forms/domain/entities/Form';

// 1. IMPORTAÇÕES DA LISTA ARRASTÁVEL
import DraggableFlatList, { ScaleDecorator, RenderItemParams } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

interface FormEditorProps {
  title: string;
  setTitle: (t: string) => void;
  description: string;
  setDescription: (d: string) => void;
  fields: FormField[];
  setFields: React.Dispatch<React.SetStateAction<FormField[]>>;
  accentColor?: string;
  renderAdditionalFooter?: () => React.ReactNode;
}

export default function FormEditor({ 
  title, setTitle, description, setDescription, fields, setFields, accentColor = THEME.colors.primary, renderAdditionalFooter
}: FormEditorProps) {

  const addField = () => {
    setFields([...fields, { label: '', type: 'text', required: true }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FormField, value: any) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    if (key === 'type' && value !== 'select' && value !== 'checkbox') {
      delete newFields[index].options;
    }
    setFields(newFields);
  };

  // 2. FUNÇÃO QUE RENDERIZA CADA QUESTÃO ARRASTÁVEL
  const renderFieldItem = ({ item: field, getIndex, drag, isActive }: RenderItemParams<FormField>) => {
  const index = getIndex() ?? 0;

    return (
      <ScaleDecorator>
        <View style={[styles.fieldCard, isActive && { borderColor: accentColor, elevation: 4, shadowOpacity: 0.1 }]}>
          
          <View style={styles.fieldHeader}>
            {/* ÍCONE DE ARRASTAR: Segurar aqui ativa o arrastar */}
            <TouchableOpacity onLongPress={drag} delayLongPress={100} style={styles.dragHandle}>
              <Ionicons name="reorder-two-outline" size={20} color={THEME.colors.textSecondary} />
              <Text style={[styles.fieldIndex, { color: accentColor }]}>CAMPO {index + 1}</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => removeField(index)}>
              <Ionicons name="trash-outline" size={18} color={THEME.colors.error} />
            </TouchableOpacity>
          </View>

          <CustomInput
            label="Pergunta"
            value={field.label}
            onChangeText={(text) => updateField(index, 'label', text)}
            accentColor={accentColor}
          />

          <Text style={styles.smallLabel}>Tipo de Resposta:</Text>
          <View style={styles.typeGrid}>
            {(['text', 'textarea', 'number', 'select', 'checkbox', 'image'] as FieldType[]).map((t) => (
              <TouchableOpacity 
                key={t} 
                onPress={() => updateField(index, 'type', t)}
                style={[
                  styles.typeBadge,
                  field.type === t && { backgroundColor: accentColor }
                ]}
              >
                <Text style={[styles.typeText, field.type === t && styles.typeTextActive]}>{t.toUpperCase()}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.requiredRow}>
            <Text style={styles.requiredLabel}>Resposta obrigatoria</Text>
            <Switch
              value={field.required}
              onValueChange={(v) => updateField(index, 'required', v)}
              trackColor={{ true: `${accentColor}88` }}
              thumbColor={field.required ? accentColor : '#f4f4f5'}
            />
          </View>

          {/* Configuração de Opções */}
          {(field.type === 'select' || field.type === 'checkbox') && (
            <View style={styles.optionsArea}>
              <CustomInput
                label="Opções (separe por vírgula)"
                value={field.options?.join(', ') || ''}
                onChangeText={(text) => updateField(index, 'options', text.split(',').map(s => s.trim()))}
                accentColor={accentColor}
              />
            </View>
          )}
        </View>
      </ScaleDecorator>
    );
  };

  return (
    // 3. ENVOLVER COM GESTURE HANDLER ROOT
    <GestureHandlerRootView style={{ flex: 1 }}>
      
      {/* Usamos a DraggableFlatList no lugar do map. 
          O Header vai dentro de ListHeaderComponent e o Botão de adicionar no ListFooterComponent */}
      <DraggableFlatList
        data={fields}
        onDragEnd={({ data }) => setFields(data)} // 4. SALVA A NOVA ORDEM NO SEU ESTADO
        keyExtractor={(_, index) => `field-${index}`}
        renderItem={renderFieldItem}
        
        ListHeaderComponent={
          <View style={{ marginBottom: 10 }}>
            {/* Cabeçalho do Forms */}
            <CustomInput label="Título do Formulário" value={title} onChangeText={setTitle} accentColor={accentColor} />
            <CustomInput label="Descrição" value={description} onChangeText={setDescription} accentColor={accentColor} />

            <View style={styles.divider}>
              <Text style={styles.sectionTitle}>QUESTÕES</Text>
              <View style={styles.line} />
            </View>
          </View>
        }

        ListFooterComponent={
          <TouchableOpacity style={[styles.addBtn, { borderColor: accentColor, marginBottom: 30 }]} onPress={addField}>
            <Ionicons name="add-circle-outline" size={22} color={accentColor} />
            <Text style={[styles.addBtnText, { color: accentColor }]}>Adicionar Pergunta</Text>
          </TouchableOpacity>
        }
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  sectionTitle: { fontSize: 10, fontFamily: 'Jakarta-Bold', color: THEME.colors.textSecondary },
  line: { flex: 1, height: 1, backgroundColor: THEME.colors.border },
  fieldCard: { backgroundColor: THEME.colors.surface, borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: THEME.colors.border },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  dragHandle: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingVertical: 4 }, // Novo estilo para a área do clique
  fieldIndex: { fontSize: 9, color: THEME.colors.primary, fontFamily: 'Jakarta-Bold' },
  smallLabel: { fontSize: 10, color: THEME.colors.textSecondary, marginBottom: 5, marginTop: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBadge: {
    flexBasis: '31%',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  typeText: { fontSize: 10, fontFamily: 'Jakarta-Bold', color: THEME.colors.textSecondary },
  typeTextActive: { color: '#FFF' },
  requiredRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  requiredLabel: { fontSize: 12, color: THEME.colors.textSecondary, fontFamily: 'Jakarta-SemiBold' },
  optionsArea: { marginTop: 10, borderTopWidth: 1, borderTopColor: THEME.colors.border },
  addBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderWidth: 1, borderColor: THEME.colors.primary, borderStyle: 'dashed', borderRadius: 12 },
  addBtnText: { marginLeft: 8, color: THEME.colors.primary, fontFamily: 'Jakarta-Bold', fontSize: 14 }
});