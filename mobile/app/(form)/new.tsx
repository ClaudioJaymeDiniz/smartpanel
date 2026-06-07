import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Switch, Keyboard } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import FormEditor from '@/presentation/forms/components/FormEditor';
import { FormRepositoryImpl } from '@/data/forms/repositories/FormRepositoryImpl';
import { FormField } from '@/core/forms/domain/entities/Form';

export default function NewForm() {
  const router = useRouter();
  const { projectId, color } = useLocalSearchParams();
  const formRepo = new FormRepositoryImpl();
  const projectColor = typeof color === 'string' && color ? color : THEME.colors.primary;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<FormField[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleSave = async () => {
    if (!title || fields.length === 0) return Alert.alert('Aviso', 'Preencha o título e adicione campos.');
    setLoading(true);
    try {
      await formRepo.create({
        title,
        description,
        isPublic,
        projectId: projectId as string,
        structure: fields,
      });
      Alert.alert('Sucesso', 'Formulário publicado!');
      router.back();
    } catch (e) {
      Alert.alert('Erro', 'Falha ao salvar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: THEME.colors.background }}>
      <Stack.Screen options={{ title: 'Novo Formulário', headerTintColor: projectColor }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <View style={{ flex: 1, paddingBottom: 120 }}>
          <Container>
            <View style={{ flex: 1, paddingTop: 20 }}>
              <View style={{ marginBottom: 16, borderWidth: 1, borderColor: THEME.colors.border, borderRadius: 12, padding: 14, backgroundColor: THEME.colors.surface }}>
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

              <FormEditor
                title={title}
                setTitle={setTitle}
                description={description}
                setDescription={setDescription}
                fields={fields}
                setFields={setFields}
                accentColor={projectColor}
              />
            </View>
          </Container>
        </View>
      </KeyboardAvoidingView>

      {keyboardHeight === 0 && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 16,
            backgroundColor: THEME.colors.background,
            borderTopWidth: 1,
            borderTopColor: THEME.colors.border,
          }}
        >
          <TouchableOpacity
            style={{ backgroundColor: projectColor, height: 55, borderRadius: 16, justifyContent: 'center', alignItems: 'center' }}
            onPress={handleSave}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={{ color: '#FFF', fontFamily: 'Jakarta-Bold' }}>PUBLICAR FORMULÁRIO</Text>}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
