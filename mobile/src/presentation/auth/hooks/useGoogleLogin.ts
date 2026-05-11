import { useState } from 'react';
import { Alert } from 'react-native';

export function useGoogleLogin() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(false);
    // TODO: Google Login será configurado após a apresentação
    Alert.alert(
      'Em Desenvolvimento',
      'Google Login estará disponível em breve. Use email/senha por enquanto.'
    );
  };

  return { loading, handleGoogleLogin };
}
