import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, 
  KeyboardAvoidingView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/src/styles/theme';
import { api } from '@/src/services/api';
import Container from '@/src/components/common/Container';
import CustomInput from '@/src/components/common/CustomInput'; 

interface Field {
  label: string;
  type: string;
  required: boolean;
  options?: string[];
  optionsRaw?: string; // Para manter a string original do input 
}

export default function NewForm() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Field[]>([]);
  const [loading, setLoading] = useState(false);

  const addField = () => {
    setFields([...fields, { label: '', type: 'text', required: true }]);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: string, value: any, rawText?: string) => {
  setFields(prevFields => {
    const newFields = [...prevFields];
    const updatedField = { ...newFields[index] } as any; // Usamos as any aqui para facilitar a manipulação dinâmica

    if (key === 'options') {
      updatedField.options = value;
      updatedField.optionsRaw = rawText;
    } else {
      updatedField[key] = value;
    }

    if (key === 'type' && value !== 'select' && value !== 'checkbox') {
      delete updatedField.options;
      delete updatedField.optionsRaw;
    }

    newFields[index] = updatedField;
    return newFields;
  });
};

  const handleSave = async () => {
  if (!title || fields.length === 0) {
    return Alert.alert("Atenção", "Preencha o título e adicione pelo menos um campo.");
  }

  setLoading(true);
  try {
    // Removemos o optionsRaw de cada campo antes de enviar
    const sanitizedFields = fields.map(({ optionsRaw, ...rest }) => rest);

    const payload = {
      title,
      description,
      projectId,
      fields: sanitizedFields 
    };

    await api.post('/forms/', payload);
    Alert.alert("Sucesso", "Formulário criado!");
    router.back();
  } catch (error) {
    console.error(error);
    Alert.alert("Erro", "Falha ao salvar no backend.");
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
    <Stack.Screen options={{ title: 'Configurar Formulário', headerShadowVisible: false }} />

    <KeyboardAvoidingView 
      // IMPORTANTE: No Android, o 'padding' costuma funcionar melhor 
      // quando o botão está fora do ScrollView.
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      // No Android, deixe o offset em 0 ou um valor baixo (ex: 20)
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
    >
      <View style={{ flex: 1 }}>
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
        <Container>
          {/* Informações Básicas usando seu CustomInput */}
          <View style={styles.headerSection}>
            <CustomInput label="Título" value={title} onChangeText={setTitle} />
            <CustomInput label="Descrição" value={description} onChangeText={setDescription} />
          </View>

          <View style={styles.fieldsDivider}>
            <Text style={styles.sectionTitle}>Estrutura de Coleta</Text>
            <View style={styles.line} />
          </View>

          {/* Lista Dinâmica de Campos */}
          {fields.map((field, index) => (
            <View key={index} style={styles.fieldCard}>
              <View style={styles.fieldHeader}>
                <Text style={styles.fieldIndex}>CAMPO {index + 1}</Text>
                <TouchableOpacity onPress={() => removeField(index)}>
                  <Ionicons name="close-circle" size={22} color={THEME.colors.error} />
                </TouchableOpacity>
              </View>

              {/* CustomInput aplicado dentro do card dinâmico */}
              <CustomInput
                label="Nome da pergunta"
                value={field.label}
                onChangeText={(text) => updateField(index, 'label', text)}
              />

              {/* Controle de Obrigatoriedade */}
              <View style={styles.requiredRow}>
                <Text style={styles.requiredLabel}>Resposta obrigatória?</Text>
                <TouchableOpacity 
                  onPress={() => updateField(index, 'required', !field.required)}
                  style={[styles.switchThumb, field.required && styles.switchThumbActive]}
                >
                  <View style={[styles.switchCircle, field.required && styles.switchCircleActive]} />
                </TouchableOpacity>
              </View>

              <Text style={styles.typeLabel}>Tipo de dado esperado:</Text>
              
              <View style={styles.typeSelector}>
                {[
                  { id: 'text', label: 'Texto', icon: 'remove' },
                  { id: 'textarea', label: 'Box', icon: 'menu' },
                  { id: 'select', label: 'Lista', icon: 'list' },
                  { id: 'checkbox', label: 'Check', icon: 'checkmark-done' },
                  { id: 'image', label: 'Foto', icon: 'camera' },
                  { id: 'file', label: 'Arquivo', icon: 'document' },
                  
                ].map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[styles.typeBtn, field.type === item.id && styles.typeBtnActive]}
                    onPress={() => updateField(index, 'type', item.id)}
                  >
                    <Ionicons 
                        name={item.icon as any} 
                        size={12} 
                        color={field.type === item.id ? '#FFF' : THEME.colors.textSecondary} 
                    />
                    <Text style={[styles.typeBtnText, field.type === item.id && styles.typeBtnTextActive]}>
                      {item.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Lógica para Opções (Aparece apenas para LISTA ou CHECKBOX) */}
              {(field.type === 'select' || field.type === 'checkbox') && (
                    <View style={styles.optionsContainer}>
                      <CustomInput
                        label="Opções (Ex: Bom, Regular, Ruim)"
                        value={field.optionsRaw || field.options?.join(', ') || ''} 
                        onChangeText={(text) => {
                          const optionsArray = text.split(',').map(s => s.trim());
                          updateField(index, 'options', optionsArray, text); 
                        }}
                      />
                  <Text style={styles.optionsHint}>
                    * O usuário poderá selecionar apenas uma dessas opções.
                  </Text>
                </View>
              )}
            </View>
          ))}

          <TouchableOpacity style={styles.addBtn} onPress={addField}>
              <Ionicons name="add-circle" size={24} color={THEME.colors.primary} />
              <Text style={styles.addBtnText}>Novo Campo de Coleta</Text>
            </TouchableOpacity>
          </Container>
        </ScrollView>

      <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveBtn, loading && { opacity: 0.7 }]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveBtnText}>
              {loading ? 'Sincronizando...' : 'Publicar Formulário'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  </View>
);
}

const styles = StyleSheet.create({
  main: { backgroundColor: THEME.colors.background }, 
  
  scroll: { 
    paddingTop: 10, 
    // Aumente para 100 ou 120. Isso cria uma "área de respiro" no final da lista
    // permitindo que o Android role o campo de opções para cima do teclado.
    paddingBottom: 120, 
  },
  headerSection: { marginBottom: 10, marginTop: 40 },
  
  fieldsDivider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  sectionTitle: { fontSize: 14, fontFamily: 'Jakarta-Bold', color: THEME.colors.textSecondary, letterSpacing: 1 },
  line: { flex: 1, height: 1, backgroundColor: THEME.colors.border },
  
  fieldCard: { 
    backgroundColor: THEME.colors.surface, 
    borderRadius: 20, 
    padding: 20, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  fieldHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: -10 },
  fieldIndex: { fontSize: 10, color: THEME.colors.primary, fontFamily: 'Jakarta-Bold' },
  
  typeLabel: { fontSize: 12, color: THEME.colors.textSecondary, marginBottom: 10, marginTop: 10, fontFamily: 'Jakarta-Regular' },
  typeSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeBtn: { 
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6, 
    paddingHorizontal: 8, 
    borderRadius: 8, 
    backgroundColor: '#F1F5F9',
    marginBottom: 4
  },
  typeBtnActive: { backgroundColor: THEME.colors.primary },
  typeBtnText: { fontSize: 11, fontFamily: 'Jakarta-Bold', color: THEME.colors.textSecondary },
  typeBtnTextActive: { color: '#FFF' },

  addBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    padding: 18, 
    borderWidth: 2, 
    borderColor: THEME.colors.primary, 
    borderStyle: 'dashed',
    borderRadius: 20,
    marginTop: 10
  },
  addBtnText: { marginLeft: 10, color: THEME.colors.primary, fontFamily: 'Jakarta-Bold', fontSize: 16 },

  requiredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  requiredLabel: {
    fontSize: 13,
    fontFamily: 'Jakarta-SemiBold',
    color: THEME.colors.textPrimary,
  },
  switchThumb: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CBD5E1',
    padding: 2,
  },
  switchThumbActive: {
    backgroundColor: THEME.colors.primary,
  },
  switchCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    elevation: 2,
  },
  switchCircleActive: {
    alignSelf: 'flex-end',
  },
  optionsContainer: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#F1F5F9',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  optionsHint: {
    fontSize: 10,
    color: THEME.colors.textSecondary,
    marginTop: -8,
    fontFamily: 'Jakarta-Regular',
  },

  footer: { 
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: THEME.colors.background, 
    borderTopWidth: 1, 
    borderTopColor: THEME.colors.border,
    // Remova o height fixo se ele estiver atrapalhando, ou deixe em 90
    height: 90, 
  },
  saveBtn: { 
    backgroundColor: THEME.colors.primary, 
    height: 58, 
    borderRadius: 18, 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  saveBtnText: { 
    color: '#FFF', 
    fontSize: 18, 
    fontFamily: 'Jakarta-Bold' 
  },

 
});