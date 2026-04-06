import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import SmartAlert from '@/components/common/SmartAlert';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';

const PRESET_COLORS = ['#3B82F6','#F59E0B', '#EF4444', '#8B5CF6', '#99ccff', '#000000'];

export default function EditProject() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { alertConfig, showAlert, hideAlert } = useAlert();
  const projectRepo = new ProjectRepositoryImpl();

  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#3B82F6');

  useEffect(() => {
    const loadProject = async () => {
      try {
        const all = await projectRepo.listActive();
        const current = all.find((p: any) => p.id === id);
        if (current) {
          setName(current.name);
          setDescription(current.description || '');
          setThemeColor(current.color || current.themeColor || '#3B82F6');
        }
      } catch (e) {
        showAlert("Erro", "Não foi possível carregar os dados do projeto.");
      } finally {
        setLoading(false);
      }
    };
    loadProject();
  }, [id]);

  const handleUpdate = async () => {
    if (!name.trim()) return showAlert("Atenção", "O nome não pode estar vazio.");

    setSaveLoading(true);
    try {
      // Aqui usamos a lógica de update do seu repositório
      await projectRepo.update(id as string, {
        name,
        description,
        themeColor: themeColor,
      });

      showAlert("Sucesso", "Projeto atualizado com sucesso!", () => {
        router.replace('/(drawer)/(tabs)'); // Volta para a Home para ver a mudança
      });
    } catch (error) {
      showAlert("Erro", "Falha ao atualizar o projeto.");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={THEME.colors.primary} />;

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ title: 'Editar Projeto', headerTintColor: themeColor }} />
      <SmartAlert {...alertConfig} onCancel={hideAlert} />

      <ScrollView>
        <Container>
          <View style={styles.form}>
            <Text style={styles.label}>Nome do Projeto</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />

            <Text style={styles.label}>Descrição</Text>
            <TextInput 
              style={[styles.input, { height: 80 }]} 
              value={description} 
              onChangeText={setDescription} 
              multiline
            />

            <Text style={styles.label}>Personalização (Cor)</Text>
            <View style={styles.colorGrid}>
              {PRESET_COLORS.map(color => (
                <TouchableOpacity 
                  key={color}
                  style={[styles.colorOption, { backgroundColor: color }, themeColor === color && styles.colorActive]}
                  onPress={() => setThemeColor(color)}
                >
                  {themeColor === color && <Ionicons name="checkmark" size={20} color="#FFF" />}
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.saveBtn, { backgroundColor: themeColor }]} 
              onPress={handleUpdate}
              disabled={saveLoading}
            >
              {saveLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Salvar Alterações</Text>}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.archiveBtn} 
              onPress={() => showAlert("Aviso", "A função de arquivar estará disponível na próxima versão do backend.")}
            >
              <Ionicons name="archive-outline" size={20} color="#94A3B8" />
              <Text style={styles.archiveText}>Arquivar Projeto</Text>
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.colors.background },
  form: { marginTop: 20, paddingBottom: 40 },
  label: { ...THEME.fonts.body, fontFamily: 'Manrope-Bold', marginBottom: 8, marginTop: 15 },
  input: { 
    backgroundColor: THEME.colors.surface, 
    padding: 15, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: THEME.colors.border,
    color: THEME.colors.textPrimary
  },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 5 , justifyContent: 'center'},
  colorOption: { width: 45, height: 45, borderRadius: 22.5, justifyContent: 'center', alignItems: 'center' },
  colorActive: { borderWidth: 3, borderColor: THEME.colors.textPrimary },
  saveBtn: { padding: 18, borderRadius: 16, marginTop: 40, alignItems: 'center', elevation: 2 },
  saveText: { ...THEME.fonts.button },
  archiveBtn: { 
    marginTop: 25, 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center', 
    gap: 8,
    padding: 10
  },
  archiveText: { color: '#94A3B8', fontFamily: 'Manrope-SemiBold' }
});