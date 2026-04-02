import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '@/src/styles/colors';
import { THEME } from '@/src/styles/theme';
import { projectService } from '@/src/services/projectService';
import { useAuth } from '@/src/store/AuthContext';

export default function EditProject() {
  const { isOffline } = useAuth();
  const router = useRouter();
  const { id } = useLocalSearchParams();
  
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#3B82F6');

  useEffect(() => {
  const load = async () => {
    try {
      // Passamos isOffline aqui também
      const projects = await projectService.getAll(isOffline); 
      const current = projects.find((p: { id: string | string[]; }) => p.id === id);
      
      if (current) {
        setName(current.name);
        setDescription(current.description || '');
        setThemeColor(current.themeColor);
      }
    } catch (e) {
      Alert.alert("Erro", "Falha ao carregar projeto.");
    } finally {
      setLoading(false);
    }
  };
  load();
}, [id, isOffline]); // Adicione isOffline às dependências

  const handleSave = async () => {
  try {
    // CORREÇÃO: Passamos o terceiro argumento (isOffline)
    await projectService.update(
      id as string, 
      { 
        name, 
        description, 
        themeColor: themeColor.startsWith('#') ? themeColor : `#${themeColor}` 
      },
      isOffline // O parâmetro que faltava!
    );

    Alert.alert("Sucesso", "Projeto atualizado!");
    router.back();
  } catch (e) {
    console.error(e);
    Alert.alert("Erro", "Falha na atualização.");
  }
};

  if (loading) return <ActivityIndicator style={{flex:1}} color={COLORS.primary} />;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Configurações do Projeto' }} />
      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Cor do Tema (Hex)</Text>
        <View style={styles.colorRow}>
          <TextInput 
            style={[styles.input, { flex: 1 }]} 
            value={themeColor} 
            onChangeText={setThemeColor} 
            placeholder="#000000"
          />
          <View style={[styles.colorPreview, { backgroundColor: themeColor }]} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Text style={styles.saveText}>Salvar Alterações</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.deleteBtn} 
          onPress={() => Alert.alert("Aviso", "Para excluir, use a Lixeira em breve.")}
        >
          <Text style={{color: '#FF4444'}}>Mover para Lixeira</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  label: { ...THEME.fonts.body, marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary },
  colorRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  colorPreview: { width: 50, height: 50, borderRadius: 10 },
  saveBtn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, marginTop: 30, alignItems: 'center' },
  saveText: { ...THEME.fonts.button },
  deleteBtn: { marginTop: 20, alignItems: 'center', padding: 10 }
});