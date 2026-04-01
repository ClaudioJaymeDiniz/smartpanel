import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import { api } from '../../src/services/api';
import { useRouter } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async () => {
    try {
      // Enviando como JSON para o FastAPI
      const payload = {
        email,
        name,
        password,
        provider: 'local', // Cadastro manual sempre será local
      };

      await api.post('/auth/register', payload);

      Alert.alert("Sucesso", "Conta criada! Agora faça seu login.");
      router.replace('/(auth)/login');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Erro ao cadastrar";
      Alert.alert("Erro", errorMsg);
    }
  };

  return (
    <View>
      <TextInput placeholder="Nome Completo" onChangeText={setName} />
      <TextInput placeholder="E-mail" onChangeText={setEmail} />
      <TextInput placeholder="Senha" secureTextEntry onChangeText={setPassword} />
      
      <TouchableOpacity onPress={handleRegister}>
        <Text>Criar Conta</Text>
      </TouchableOpacity>
    </View>
  );
}