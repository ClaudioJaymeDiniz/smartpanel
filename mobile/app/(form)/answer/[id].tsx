import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Switch 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import CustomInput from '@/components/common/CustomInput'; // Seu componente animado
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { SubmissionRepositoryImpl } from '@/data/forms/repositories/SubmissionRepositoryImpl';
import { useSubmissions } from '@/presentation/forms/hooks/useSubmissions'; // Hook com UseCase
import { Form, FormField } from '@/core/forms/domain/entities/Form';

export default function AnswerFormScreen() {
  const { id, submissionId } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});

  const formRepo = new FormRepositoryImpl();
  const submissionRepo = new SubmissionRepositoryImpl();
  const { submitForm, submitting } = useSubmissions(); // Usando a lógica nova
  const isEditMode = typeof submissionId === 'string' && submissionId.length > 0;

  useEffect(() => {
    loadForm();
  }, [id]);

  const loadForm = async () => {
    try {
      const data = await formRepo.getById(id as string);
      setForm(data);
      
      // Inicializa o estado das respostas
      const initial: Record<string, any> = {};
      data.structure.forEach((f: FormField) => {
        initial[f.label] = f.type === 'checkbox' ? [] : '';
      });

      if (isEditMode) {
        const list = await submissionRepo.listByForm(id as string);
        const current = list.find((s) => s.id === submissionId);
        if (current?.formData) {
          Object.assign(initial, current.formData);
        }
      }

      setResponses(initial);
    } catch (error) {
      Alert.alert("Erro", "Formulário não encontrado.");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    // Validação de campos obrigatórios
    const missing = form?.structure.find(f => f.required && !responses[f.label]);
    if (missing) return Alert.alert("Ops!", `O campo "${missing.label}" é obrigatório.`);

    try {
      if (isEditMode) {
        await submissionRepo.update(submissionId as string, responses);
        Alert.alert("Sucesso!", "Resposta atualizada com sucesso.");
      } else {
        await submitForm(id as string, responses);
        Alert.alert("Sucesso!", "Dados coletados com sucesso.");
      }
      router.replace(`/(form)/${id}`);
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Falha ao enviar. Verifique sua conexão ou tente novamente.";
      Alert.alert("Erro", message);
    }
  };

  const renderField = (field: FormField) => {
    const value = responses[field.label];

    switch (field.type) {
      case 'checkbox':
        return (
          <View style={styles.selectArea}>
            <Text style={styles.smallLabel}>{field.label} (Selecione uma ou mais opções)</Text>
            <View style={styles.optionsGrid}>
              {field.options?.map((opt) => {
                const isSelected = Array.isArray(value) ? value.includes(opt) : false;
                return (
                  <TouchableOpacity 
                    key={opt}
                    style={[styles.optBtn, isSelected && styles.optBtnActive]}
                    onPress={() => {
                      const arr = Array.isArray(value) ? [...value] : [];
                      if (arr.includes(opt)) {
                        arr.splice(arr.indexOf(opt), 1);
                      } else {
                        arr.push(opt);
                      }
                      setResponses({...responses, [field.label]: arr});
                    }}
                  >
                    <Text style={[styles.optText, isSelected && styles.optTextActive]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        );

      case 'select':
        return (
          <View style={styles.selectArea}>
            <Text style={styles.smallLabel}>{field.label} (Selecione uma opção)</Text>
            <View style={styles.optionsGrid}>
              {field.options?.map((opt) => (
                <TouchableOpacity 
                  key={opt}
                  style={[styles.optBtn, value === opt && styles.optBtnActive]}
                  onPress={() => setResponses({...responses, [field.label]: opt})}
                >
                  <Text style={[styles.optText, value === opt && styles.optTextActive]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

      default: // text, number, textarea
        return (
          <CustomInput 
            label={field.label}
            value={value?.toString() || ''}
            onChangeText={(t) => setResponses({...responses, [field.label]: t})}
            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
            multiline={field.type === 'textarea'}
          />
        );
    }
  };

  if (loading) return <View style={styles.centered}><ActivityIndicator color={THEME.colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <Stack.Screen options={{ title: isEditMode ? 'Editar Resposta' : 'Coleta em Campo' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Container>
            <Text style={styles.title}>{form?.title}</Text>
            <Text style={styles.desc}>{form?.description || 'Preencha os dados abaixo.'}</Text>

            <View style={styles.formBody}>
              {form?.structure.map((field, index) => (
                <View key={index} style={{ marginBottom: 15 }}>
                  {renderField(field)}
                </View>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.btn, submitting && { opacity: 0.6 }]} 
              onPress={handleSend}
              disabled={submitting}
            >
              {submitting ? <ActivityIndicator color="#FFF" /> : (
                <Text style={styles.btnText}>{isEditMode ? 'SALVAR ALTERACOES' : 'ENVIAR RESPOSTA'}</Text>
              )}
            </TouchableOpacity>
          </Container>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scroll: { paddingVertical: 30 },
  title: { fontSize: 24, fontFamily: 'Jakarta-Bold', color: THEME.colors.textPrimary },
  desc: { fontSize: 14, color: THEME.colors.textSecondary, marginBottom: 30 },
  formBody: { marginBottom: 40 },
  cardField: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 16, backgroundColor: '#FFF', borderRadius: 16, borderWidth: 1, borderColor: THEME.colors.border 
  },
  cardLabel: { fontFamily: 'Jakarta-SemiBold', color: THEME.colors.textPrimary },
  selectArea: { marginBottom: 10 },
  smallLabel: { fontSize: 12, color: THEME.colors.textSecondary, marginBottom: 10, fontFamily: 'Jakarta-Bold' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: THEME.colors.border, backgroundColor: '#FFF' },
  optBtnActive: { backgroundColor: THEME.colors.primary, borderColor: THEME.colors.primary },
  optText: { fontSize: 13, color: THEME.colors.textSecondary },
  optTextActive: { color: '#FFF', fontFamily: 'Jakarta-Bold' },
  btn: { backgroundColor: THEME.colors.primary, height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  btnText: { color: '#FFF', fontFamily: 'Jakarta-Bold', fontSize: 16 }
});