import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { COLORS } from '@/src/styles/colors';
import { THEME } from '@/src/styles/theme';
import { projectService } from '@/src/services/projectService';
import { useAuth } from '@/src/store/AuthContext';

export default function NewProject() {
  const router = useRouter();
  const { isOffline } = useAuth();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [themeColor, setThemeColor] = useState('#3B82F6'); 

  const handleCreate = async () => {
    if (!name.trim()) return Alert.alert("Ops", "Dê um nome ao projeto.");

    try {
      await projectService.create({ name, description, themeColor }, isOffline);
      router.replace('/(drawer)/(tabs)'); 
    } catch (error: any) {
      console.log("Erro no servidor:", error.response?.data);
      Alert.alert("Erro", "Falha ao criar projeto. Verifique os dados.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Stack.Screen options={{ title: 'Novo Projeto' }} />
      <View style={{ padding: 20 }}>
        <Text style={styles.label}>Nome do Projeto</Text>
        <TextInput 
          style={styles.input}
          value={name}
          onChangeText={setName} // LIBERADO PARA DIGITAR
          placeholder="Ex: Minha Empresa"
          placeholderTextColor={COLORS.textSecondary}
        />

        <Text style={styles.label}>Cor do Tema (Hex)</Text>
        <View style={styles.colorRow}>
          <TextInput 
            style={[styles.input, { flex: 1 }]}
            value={themeColor}
            onChangeText={setThemeColor}
            placeholder="#FFD700"
          />
          <View style={[styles.colorBox, { backgroundColor: themeColor }]} />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleCreate}>
          <Text style={styles.btnText}>Criar Projeto</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  label: { ...THEME.fonts.body, marginTop: 20, marginBottom: 8 },
  input: { backgroundColor: COLORS.surface, padding: 15, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, color: COLORS.textPrimary },
  colorRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  colorBox: { width: 50, height: 50, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border },
  btn: { backgroundColor: COLORS.primary, padding: 18, borderRadius: 15, marginTop: 40, alignItems: 'center' },
  btnText: { ...THEME.fonts.button }
});