import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { THEME } from '@/styles/theme';
import Container from '@/components/common/Container'; 
import Logo from '@/components/common/Logo';

export default function NotFoundScreen() {
  return (
    <>
      {/* Define o título da barra de navegação caso apareça */}
      <Stack.Screen options={{ title: 'Página não encontrada', headerShown: true }} />
      
      <Container style={styles.container}>
        <View style={styles.content}>
          <Logo size={40} />
          
          <Text style={styles.errorCode}>404</Text>
          
          <Text style={styles.title}>Ops! Caminho errado.</Text>
          
          <Text style={styles.message}>
            Parece que essa página não existe ou foi movida durante uma atualização.
          </Text>

          <Link href="/(drawer)" asChild>
            <TouchableOpacity style={styles.button}>
              <Text style={styles.buttonText}>Voltar para o Início</Text>
            </TouchableOpacity>
          </Link>
        </View>

        <Text style={styles.footer}>SmartPanel © 2026</Text>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: THEME.colors.background,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  errorCode: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 80,
    color: THEME.colors.border, // Um cinza bem clarinho de fundo
    position: 'absolute',
    top: '25%',
    zIndex: -1,
  },
  title: {
    ...THEME.fonts.title,
    fontSize: 24,
    marginTop: 20,
    textAlign: 'center',
  },
  message: {
    ...THEME.fonts.body,
    textAlign: 'center',
    color: THEME.colors.textSecondary,
    marginTop: 10,
    paddingHorizontal: 20,
  },
  button: {
    marginTop: 30,
    backgroundColor: THEME.colors.primary, // Seu Verde Forest
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    ...THEME.fonts.button,
  },
  footer: {
    ...THEME.fonts.body,
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginBottom: 20,
  }
});