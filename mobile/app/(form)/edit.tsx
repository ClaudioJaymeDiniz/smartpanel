import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import FormEditor from '@/presentation/forms/components/FormEditor';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { UpdateFormUseCase } from '@/core/forms/usecases/UpdateFormuseCase';
import { FormField } from '@/core/forms/domain/entities/Form';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';

export default function EditForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const repository = new FormRepositoryImpl();
  const updateFormUseCase = new UpdateFormUseCase(repository);
  const projectRepository = new ProjectRepositoryImpl();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [projectColor, setProjectColor] = useState(THEME.colors.primary);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      try {
        const form = await repository.getById(id as string);
        setTitle(form.title || '');
        setDescription(form.description || '');
        setFields((form.structure || []) as FormField[]);
        setIsPublic(Boolean((form as any).isPublic));

        const project = await projectRepository.findById(form.projectId);
        const color = project?.color || project?.themeColor || THEME.colors.primary;
        setProjectColor(color);
      } catch (error) {
        Alert.alert('Erro', 'Nao foi possivel carregar o formulario para edicao.');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id]);

  const handleUpdate = async () => {
    if (!title || fields.length === 0) {
      return Alert.alert('Aviso', 'Preencha o titulo e ao menos um campo.');
    }

    setSaving(true);
    try {
      await updateFormUseCase.execute(id as string, {
        title,
        description,
          isPublic,
        structure: fields,
      });
      Alert.alert('Sucesso', 'Formulario atualizado com sucesso.');
      router.replace(`/(form)/${id}`);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao atualizar o formulario.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: THEME.colors.background }}>
        <ActivityIndicator color={THEME.colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <Stack.Screen options={{ title: 'Editar Formulario' }} />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingTop: 20, paddingBottom: 110 }}>
          <Container>
            <FormEditor
              title={title}
              setTitle={setTitle}
              description={description}
              setDescription={setDescription}
              fields={fields}
              setFields={setFields}
              accentColor={projectColor}
            />

            <View style={{ marginTop: 16, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: 12, padding: 14, backgroundColor: THEME.colors.surface }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flex: 1, paddingRight: 10 }}>
                  <Text style={{ color: THEME.colors.textPrimary, fontFamily: 'Jakarta-Bold', fontSize: 14 }}>Formulario publico</Text>
                  <Text style={{ color: THEME.colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                    Se ativado, usuarios fora do projeto podem responder.
                  </Text>
                </View>
                <Switch
                  value={isPublic}
                  onValueChange={setIsPublic}
                  trackColor={{ true: `${projectColor}88` }}
                  thumbColor={isPublic ? projectColor : '#f4f4f5'}
                />
              </View>
            </View>
          </Container>
        </ScrollView>

        <View style={{ padding: 20, backgroundColor: THEME.colors.background, borderTopWidth: 1, borderTopColor: THEME.colors.border }}>
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={saving}
              style={{ backgroundColor: projectColor, height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center', opacity: saving ? 0.7 : 1 }}
          >
            {saving ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontFamily: 'Jakarta-Bold' }}>SALVAR ALTERACOES</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}