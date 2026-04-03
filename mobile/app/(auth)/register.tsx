import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { api } from '@/src/services/api';
import CustomInput from '@/src/components/common/CustomInput';
import Logo from '@/src/components/common/Logo';
import DeveloperFooter from '@/src/components/common/DeveloperFooter';
import { THEME } from '@/src/styles/theme';

export default function RegisterScreen() {
  const router = useRouter();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert("Campos Vazios", "Por favor, preencha todos os dados.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        email,
        name,
        password,
        provider: 'local',
      };

      // Chamada para o seu FastAPI no Linux Mint
      await api.post('/auth/register', payload);

      Alert.alert("Sucesso", "Conta criada com sucesso! Agora você pode acessar o painel.");
      router.replace('/(auth)/login');
    } catch (error: any) {
      const errorMsg = error.response?.data?.detail || "Erro ao conectar com o servidor.";
      Alert.alert("Erro no Cadastro", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* KeyboardAvoidingView evita que o teclado cubra os inputs no Android */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          {/* Botão Voltar */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={THEME.colors.primary} />
          </TouchableOpacity>

          <View style={styles.content}>
            {/* Header com Logo */}
            <View style={styles.header}>
              <Logo size={32} />
              <Text style={styles.title}>Criar Conta</Text>
              <Text style={styles.subtitle}>Junte-se ao SmartPanel e organize seus dados.</Text>
            </View>

            {/* Formulário com CustomInput */}
            <View style={styles.form}>
              <CustomInput 
                label="Nome Completo"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />

              <CustomInput 
                label="E-mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput 
                label="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <TouchableOpacity 
                style={styles.buttonMain} 
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.buttonMainText}>Finalizar Cadastro</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Link para voltar ao Login */}
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/login')}
              style={styles.footerLink}
            >
              <Text style={styles.footerLinkText}>
                Já tem uma conta? <Text style={styles.footerLinkBold}>Entrar</Text>
              </Text>
            </TouchableOpacity>
          </View>
          
          <DeveloperFooter />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  scrollContent: { flexGrow: 1 },
  backButton: { 
    padding: 20, 
    marginTop: Platform.OS === 'android' ? 10 : 0 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 30, 
    paddingBottom: 40 
  },
  header: { marginBottom: 30 },
  title: { 
    ...THEME.fonts.title, 
    fontSize: 24, 
    marginTop: 20 
  },
  subtitle: { 
    ...THEME.fonts.subtitle, 
    fontSize: 14, 
    marginTop: 5 
  },
  form: { width: '100%' },
  buttonMain: {
    height: 55,
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  buttonMainText: { ...THEME.fonts.button },
  footerLink: { 
    marginTop: 30, 
    alignItems: 'center' 
  },
  footerLinkText: { 
    color: THEME.colors.textSecondary, 
    fontFamily: 'Manrope-Regular' 
  },
  footerLinkBold: { 
    color: THEME.colors.primary, 
    fontFamily: 'Jakarta-Bold' 
  }
});