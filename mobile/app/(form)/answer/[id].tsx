import React, { useState, useEffect } from 'react';
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, KeyboardAvoidingView, Platform, Alert, Image 
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import CustomInput from '@/components/common/CustomInput';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { SubmissionRepositoryImpl } from '@/data/forms/repositories/SubmissionRepositoryImpl';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';
import { useSubmissions } from '@/presentation/forms/hooks/useSubmissions'; 
import { Form, FormField } from '@/core/forms/domain/entities/Form';
import {
  getImagePreviewUri,
  hasImageValue,
  isLocalImageValue,
  pickAndPersistImage,
} from '@/services/formImage';

export default function AnswerFormScreen() {
  const { id, submissionId } = useLocalSearchParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Form | null>(null);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isProjectArchived, setIsProjectArchived] = useState(false);

  const formRepo = new FormRepositoryImpl();
  const submissionRepo = new SubmissionRepositoryImpl();
  const projectRepo = new ProjectRepositoryImpl();
  const { submitForm, submitting } = useSubmissions(); // Usando a lógica nova
  const isEditMode = typeof submissionId === 'string' && submissionId.length > 0;

  useEffect(() => {
    loadForm();
  }, [id]);

  const isFieldFilled = (field: FormField, value: any) => {
    if (field.type === 'checkbox') {
      return Array.isArray(value) && value.length > 0;
    }

    if (field.type === 'image') {
      return hasImageValue(value);
    }

    return value !== null && value !== undefined && String(value).trim().length > 0;
  };

  const loadForm = async () => {
    try {
      const data = await formRepo.getById(id as string);
      setForm(data);

      if (data?.projectId) {
        try {
          const projectData = await projectRepo.findById(data.projectId);
          const archived = Boolean(projectData?.deletedAt);
          setIsProjectArchived(archived);

          if (archived) {
            Alert.alert('Projeto arquivado', 'Este projeto nao pode receber novas respostas.');
            router.replace(`/(form)/${id}`);
            return;
          }
        } catch {
          // Se nao conseguir validar, mantemos o fluxo e deixamos o backend garantir a regra.
        }
      }
      
      // Inicializa o estado das respostas
      const initial: Record<string, any> = {};
      data.structure.forEach((f: FormField) => {
        initial[f.label] = f.type === 'checkbox' ? [] : null;
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
    if (isProjectArchived) {
      Alert.alert('Projeto arquivado', 'Este projeto nao pode receber respostas.');
      return;
    }

    // Validação de campos obrigatórios
    const missing = form?.structure.find((f) => f.required && !isFieldFilled(f, responses[f.label]));
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

    const handlePickImage = async () => {
      try {
        const image = await pickAndPersistImage();
        if (!image) return;

        setResponses({
          ...responses,
          [field.label]: image,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Nao foi possivel selecionar a imagem.';
        Alert.alert('Erro', message);
      }
    };

    switch (field.type) {
      case 'image': {
        const previewUri = getImagePreviewUri(value);

        return (
          <View style={styles.imageArea}>
            <Text style={styles.smallLabel}>{field.label}</Text>
            <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
              <Text style={styles.imageButtonText}>
                {previewUri ? 'Trocar imagem' : 'Selecionar imagem'}
              </Text>
            </TouchableOpacity>

            {previewUri ? (
              <View style={styles.imagePreviewCard}>
                <Image source={{ uri: previewUri }} style={styles.imagePreview} />
                <Text style={styles.imageHint} numberOfLines={1}>
                  {isLocalImageValue(value) ? 'Imagem salva localmente no aparelho' : 'Imagem carregada'}
                </Text>
              </View>
            ) : null}

            {previewUri ? (
              <TouchableOpacity
                style={styles.imageClearButton}
                onPress={() => setResponses({ ...responses, [field.label]: null })}
              >
                <Text style={styles.imageClearText}>Remover imagem</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        );
      }

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
                      setResponses({ ...responses, [field.label]: arr });
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
                    onPress={() => setResponses({ ...responses, [field.label]: opt })}
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
            onChangeText={(t) => setResponses({ ...responses, [field.label]: t })}
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
  imageArea: { marginBottom: 4 },
  imageButton: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  imageButtonText: { fontFamily: 'Jakarta-Bold', color: THEME.colors.primary, fontSize: 13 },
  imagePreviewCard: {
    marginTop: 12,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 12,
  },
  imagePreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
    backgroundColor: '#E5E7EB',
  },
  imageHint: {
    marginTop: 8,
    color: THEME.colors.textSecondary,
    fontSize: 12,
    fontFamily: 'Jakarta-SemiBold',
  },
  imageClearButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FEE2E2',
  },
  imageClearText: {
    color: '#B91C1C',
    fontFamily: 'Jakarta-Bold',
    fontSize: 12,
  },
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