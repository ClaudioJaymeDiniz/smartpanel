import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import SmartAlert from '@/components/common/SmartAlert';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import { ProjectRepositoryImpl } from '@/data/projects/repositories/ProjectRepositoryImpl';

// Cores sugeridas para o seletor
const PRESET_COLORS = ['#3B82F6','#F59E0B', '#EF4444', '#8B5CF6', '#99ccff', '#000000'];

export default function NewProject() {
  const router = useRouter();
  const { alertConfig, showAlert, hideAlert } = useAlert();
  const projectRepo = new ProjectRepositoryImpl();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#3B82F6');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      return showAlert("Atenção", "O nome do projeto é obrigatório.");
    }

    setLoading(true);
    try {
      await projectRepo.create({
        name,
        description,
        themeColor: themeColor,
      });

      showAlert("Sucesso!", "Projeto criado com sucesso.", () => {
        router.replace('/(drawer)/(tabs)');
      });
    } catch (error) {
      showAlert("Erro", "Não foi possível criar o projeto agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.mainContainer}>
      <Stack.Screen options={{ title: 'Novo Projeto' }} />
      <SmartAlert {...alertConfig} onCancel={hideAlert} />

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Container>
          <View style={styles.form}>
            <Text style={styles.label}>Nome do Projeto</Text>
            <TextInput 
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ex: Inventário de TI"
              placeholderTextColor={THEME.colors.textSecondary}
            />

            <Text style={styles.label}>Descrição (Opcional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Para que serve este projeto?"
              multiline
              numberOfLines={3}
            />

            <Text style={styles.label}>Cor do Tema</Text>
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
              {/* Campo para cor customizada */}
              <View style={styles.customColorRow}>
                 <TextInput 
                  style={styles.customColorInput}
                  value={themeColor}
                  onChangeText={setThemeColor}
                  placeholder="#Hex"
                 />
                 <View style={[styles.colorPreview, { backgroundColor: themeColor }]} />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.btn, loading && { opacity: 0.7 }]} 
              onPress={handleCreate}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Criar Projeto</Text>}
            </TouchableOpacity>
          </View>
        </Container>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, backgroundColor: THEME.colors.background },
  form: { marginTop: 20 },
  label: { ...THEME.fonts.body, fontFamily: 'Manrope-Bold', marginBottom: 8, marginTop: 15 },
  input: { 
    backgroundColor: THEME.colors.surface, 
    padding: 15, 
    borderRadius: 14, 
    borderWidth: 1, 
    borderColor: THEME.colors.border, 
    color: THEME.colors.textPrimary,
    fontFamily: 'Manrope-Regular'
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 10, justifyContent: 'center' },
  colorOption: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  colorActive: { borderWidth: 3, borderColor: THEME.colors.textPrimary },
  customColorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, width: '100%', marginTop: 5 },
  customColorInput: { flex: 1, backgroundColor: THEME.colors.inputBg, padding: 10, borderRadius: 10, fontFamily: 'Manrope-Regular' },
  colorPreview: { width: 40, height: 40, borderRadius: 10 },
  btn: { backgroundColor: THEME.colors.primary, padding: 18, borderRadius: 16, marginTop: 40, alignItems: 'center' },
  btnText: { ...THEME.fonts.button }
});