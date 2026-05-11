import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

import { THEME } from '@/styles/theme';

export default function SubmitScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Envio de formulário</Text>
        <Text style={styles.description}>
          Esta rota está disponível, mas ainda não recebe uma estrutura de formulário própria.
        </Text>

        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 24,
    color: THEME.colors.textPrimary,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Manrope-Regular',
    fontSize: 15,
    lineHeight: 22,
    color: THEME.colors.textSecondary,
    marginBottom: 24,
  },
  button: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.colors.primary,
  },
  buttonText: {
    fontFamily: 'Manrope-SemiBold',
    color: '#FFF',
    fontSize: 16,
  },
});
