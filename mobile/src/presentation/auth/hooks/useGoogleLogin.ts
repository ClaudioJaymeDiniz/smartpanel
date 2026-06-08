import { useState } from 'react';
import { Alert } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';

import { AuthRepositoryImpl } from '@/data/auth/repositories/AuthRepositoryImpl';
import { useAuthStore } from '@/presentation/auth/store/useAuthStore';

WebBrowser.maybeCompleteAuthSession();

const googleWebClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
const googleAndroidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;
const googleIosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);
  const setUser = useAuthStore((state) => state.setUser);
  const repository = new AuthRepositoryImpl();

  const [request, , promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: googleAndroidClientId,
    iosClientId: googleIosClientId,
    selectAccount: true,
    webClientId: googleWebClientId,
  });

  const handleGoogleLogin = async () => {
    if (!googleWebClientId && !googleAndroidClientId && !googleIosClientId) {
      Alert.alert(
        'Google Login nao configurado',
        'Crie os Client IDs OAuth no Google Cloud e preencha EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID e EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID.'
      );
      return;
    }

    if (!request) {
      Alert.alert('Aguarde', 'O login com Google ainda esta sendo preparado.');
      return;
    }

    setLoading(true);
    try {
      const result = await promptAsync();

      if (result.type !== 'success') {
        return;
      }

      const idToken = result.params.id_token;
      if (!idToken) {
        Alert.alert('Falha no Google Login', 'O Google nao retornou o token de autenticacao.');
        return;
      }

      const session = await repository.loginWithGoogle(idToken);
      setUser(session.user);
    } catch (error) {
      console.error('Erro no Google Login:', error);
      Alert.alert('Falha no Google Login', 'Nao foi possivel entrar com Google agora.');
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleGoogleLogin };
}
