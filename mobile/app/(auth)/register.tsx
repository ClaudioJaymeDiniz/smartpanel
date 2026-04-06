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

import { api } from '@/services/api';
import CustomInput from '@/components/common/CustomInput';
import Logo from '@/components/common/Logo';
import DeveloperFooter from '@/components/common/DeveloperFooter';
import { THEME } from '@/styles/theme';
import { AuthRepositoryImpl } from '@/data/auth/repositories/AuthRepositoryImpl';
import { useAlert } from '@/presentation/shared/hooks/useAlert';
import SmartAlert from '@/components/common/SmartAlert';

export default function RegisterScreen() {
 const router = useRouter();
  const { alertConfig, showAlert, hideAlert } = useAlert(); // 1. Inicializa o Alerta
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
  if (!name || !email || !password) {
    showAlert("Campos Vazios", "Por favor, preencha todos os dados para continuar.");
    return;
  }

  setLoading(true);
  try {
    const authRepo = new AuthRepositoryImpl();
    await authRepo.register({ email, name, password });

    showAlert(
      "Sucesso!", 
      "Sua conta foi criada. Agora você já pode acessar o painel.",
      () => router.replace('/(auth)/login')
    );
  } catch (error: any) {
    // 1. Extraímos o detalhe do erro vindo do FastAPI
    const rawDetail = error.response?.data?.detail;
    let errorMsg = "Erro ao conectar com o servidor.";

    // 2. Lógica para "limpar" o erro 422 do Pydantic
    if (typeof rawDetail === 'string') {
      errorMsg = rawDetail;
    } else if (Array.isArray(rawDetail)) {
      // O FastAPI costuma mandar uma lista de erros. Pegamos a 'msg' do primeiro.
      // Ex: "field required" ou "value is not a valid email"
      const firstError = rawDetail[0];
      errorMsg = firstError?.msg || "Erro de validação nos dados.";
      
      // Opcional: Se quiser mostrar qual campo errou (ex: "email: value is not a valid email")
      if (firstError?.loc) {
        const field = firstError.loc[firstError.loc.length - 1];
        errorMsg = `${field}: ${errorMsg}`;
      }
    } else if (rawDetail?.msg) {
      errorMsg = rawDetail.msg;
    }

    showAlert("Erro no Cadastro", errorMsg);
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <SmartAlert {...alertConfig} onCancel={hideAlert} />
      
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
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