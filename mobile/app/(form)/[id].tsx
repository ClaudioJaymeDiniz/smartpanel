import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { api } from '@/src/services/api';

export default function FormDetails() {
  const { id } = useLocalSearchParams(); // Pega o ID da URL dinâmica
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const isOwner = project.ownerId === user.id;

  useEffect(() => {
    async function fetchForm() {
      try {
        const response = await api.get(`/forms/${id}`);
        setForm(response.data);
      } catch (error) {
        Alert.alert("Erro", "Não foi possível carregar o formulário.");
        router.back();
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [id]);

  if (loading) return <ActivityIndicator size="large" color="#3B82F6" style={{flex: 1}} />;

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{form?.title}</Text>
      <Text style={{ color: '#666', marginVertical: 10 }}>{form?.description}</Text>
      
      {/* Aqui você listaria as perguntas da 'structure' ou as submissões */}
      <View style={{ marginTop: 20 }}>
        <Text style={{ fontWeight: '600' }}>Campos dinâmicos detectados: {form?.structure?.length || 0}</Text>
      </View>
    </View>
  );
}