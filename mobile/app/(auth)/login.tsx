import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  SafeAreaView, ActivityIndicator, Alert, ScrollView 
} from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

import CustomInput from '@/src/components/common/CustomInput';
import Logo from '@/src/components/common/Logo';
import DeveloperFooter from '@/src/components/common/DeveloperFooter';
import { THEME } from '@/src/styles/theme';
import { useAuth } from '@/src/store/AuthContext';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Campos Vazios", "Por favor, insira e-mail e senha.");
      return;
    }

    setLoading(true);
    try {
      // Aqui acontece a mágica com o seu FastAPI (via api.ts + Interceptor)
      await signIn({ email, password });
      // Se der certo, o AuthContext muda o estado e o RootLayout te joga para o Drawer
    } catch (error: any) {
      console.error(error);
      Alert.alert("Falha no Login", "Verifique suas credenciais ou a conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          
          {/* Logo Centralizado */}
          <View style={styles.logoContainer}>
            <Logo size={40} />
            <Text style={styles.tagline}>Gestão Inteligente de Formulários</Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
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
              onPress={() => router.push('/(auth)/recover')}
              style={styles.forgotPass}
            >
              <Text style={styles.forgotText}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.buttonMain} 
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <Text style={styles.buttonMainText}>Acessar Painel</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divisor */}
          <View style={styles.dividerContainer}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.line} />
          </View>

          {/* Botões Sociais Largos */}
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            onPress={() => console.log('Google Login')} 
            style={[styles.socialButton, { borderColor: '#DB4437' }]}
          >
            <FontAwesome5 name="google" size={18} color="#DB4437" />
            <Text style={styles.socialButtonText}>Entrar com Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            onPress={() => console.log('Facebook Login')} 
            style={[styles.socialButton, { borderColor: '#4267B2' }]}
          >
            <FontAwesome5 name="facebook" size={18} color="#4267B2" />
            <Text style={styles.socialButtonText}>Entrar com Facebook</Text>
          </TouchableOpacity>
        </View>

          {/* Link para Cadastro */}
          <TouchableOpacity 
            onPress={() => router.push('/(auth)/register')}
            style={styles.footerLink}
          >
            <Text style={styles.footerLinkText}>
              Novo por aqui? <Text style={styles.footerLinkBold}>Criar conta</Text>
            </Text>
          </TouchableOpacity>

        </View>
        
        {/* Seu Rodapé reutilizável */}
        <DeveloperFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.colors.background },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'center', paddingTop: 50 },
  
  logoContainer: { alignItems: 'center', marginBottom: 50 },
  tagline: { ...THEME.fonts.subtitle, fontSize: 14, marginTop: 5 },

  form: { width: '100%' },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 25 },
  forgotText: { fontFamily: 'Manrope-Regular', color: THEME.colors.textSecondary, fontSize: 13 },
  
  buttonMain: {
    height: 55,
    backgroundColor: THEME.colors.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: THEME.colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  buttonMainText: { ...THEME.fonts.button, fontSize: 17 },

  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  line: { flex: 1, height: 1, backgroundColor: THEME.colors.border },
  dividerText: { marginHorizontal: 15, color: THEME.colors.textSecondary, fontFamily: 'Manrope-Regular' },

  socialContainer: { 
    gap: 15, // Espaçamento vertical entre os botões
    marginTop: 10 
  },
  socialButton: {
    flexDirection: 'row',
    width: '100%',
    height: 55,
    borderWidth: 1.5,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME.colors.surface,
    elevation: 1, // Sombra leve no Android (Mint)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
  },
  socialButtonText: { 
    fontSize: 15, 
    fontFamily: 'Manrope-SemiBold', 
    color: THEME.colors.textPrimary 
  },

  footerLink: { marginTop: 40, marginBottom: 20, alignItems: 'center' },
  footerLinkText: { color: THEME.colors.textSecondary, fontFamily: 'Manrope-Regular' },
  footerLinkBold: { color: THEME.colors.primary, fontFamily: 'Jakarta-Bold' }
});