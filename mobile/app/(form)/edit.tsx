import { useState, useEffect } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/src/services/api';

export default function EditForm() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Busca os dados atuais para preencher os inputs
  useEffect(() => {
    if (id) {
      api.get(`/forms/${id}`).then(res => {
        setTitle(res.data.title);
        setDescription(res.data.description);
      });
    }
  }, [id]);

  const handleUpdate = async () => {
    try {
      await api.patch(`/forms/${id}`, {
        title,
        description
      });
      Alert.alert("Sucesso", "Formulário atualizado!");
      router.back();
    } catch (error) {
      Alert.alert("Erro", "Falha ao atualizar.");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput 
        style={styles.input} 
        value={title} 
        onChangeText={setTitle} 
        placeholder="Título do Formulário" 
      />
      <TextInput 
        style={[styles.input, { height: 100 }]} 
        value={description} 
        onChangeText={setDescription} 
        placeholder="Descrição"
        multiline
      />
      <Button title="Salvar Alterações" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 8 }
});