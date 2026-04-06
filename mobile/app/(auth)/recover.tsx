import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { COLORS } from '@/styles/colors';
import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import SmartAlert from '@/components/common/SmartAlert';
import { AuthRepositoryImpl } from '@/data/auth/repositories/AuthRepositoryImpl';

export default function RecoverPassword() {
  const router = useRouter();
  const { alertConfig, showAlert, hideAlert } = useAlert(); // 1. Hook
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRecover = async () => {
    if (!email.includes('@')) {
      showAlert("E-mail inválido", "Por favor, insira um endereço de e-mail real.");
      return;
    }

    setLoading(true);
    try {
      const authRepo = new AuthRepositoryImpl();
      await authRepo.recoverPassword(email.trim());
      
      // 2. Confirmação de envio
      showAlert(
        "Link Enviado", 
        "Se este e-mail estiver cadastrado, as instruções chegarão em instantes.",
        () => router.back() // Volta para o login após o OK
      );
    } catch (error: any) {
      showAlert(
        "Ops!", 
        "Não foi possível processar a solicitação agora. Verifique sua conexão."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container style={styles.wrapper}>
      <SmartAlert {...alertConfig} onCancel={hideAlert} />
      
      <Stack.Screen options={{ title: 'Recuperar Senha', headerTransparent: true, headerTitle: '' }} />
      
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>Esqueceu a senha?</Text>
        <Text style={styles.subtitle}>
          Digite seu e-mail abaixo. Enviaremos um link para você criar uma nova senha.
        </Text>

        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={20} color={COLORS.textSecondary} style={styles.icon} />
          <TextInput
            style={styles.input}
            placeholder="Seu e-mail cadastrado"
            placeholderTextColor={COLORS.textSecondary}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleRecover}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Enviar Link</Text>
          )}
        </TouchableOpacity>
      </View>
    </Container>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 25 },
  backBtn: { marginTop: 30, marginBottom: 30 },
  content: { flex: 1, justifyContent: 'center' },
  title: { ...THEME.fonts.title, color: COLORS.textPrimary, marginBottom: 10 },
  subtitle: { ...THEME.fonts.body, color: COLORS.textSecondary, marginBottom: 40, lineHeight: 22 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 15,
    height: 60,
    marginBottom: 25,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, color: COLORS.textPrimary, fontFamily: 'Manrope-Regular' },
  button: {
    backgroundColor: COLORS.primary,
    height: 60,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  buttonText: { ...THEME.fonts.button, color: '#FFF' },
});