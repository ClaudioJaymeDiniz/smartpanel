import { Stack } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Container } from '@/src/components/common/Container';

export default function Home() {
  return (
    <>
      {/* Define o título que aparece na barra superior (Header) */}
      <Stack.Screen options={{ title: 'Início' }} />
      
      <Container>
        {/* Aqui você começará a listar os projetos do seu FastAPI */}
        <Text style={styles.welcomeText}>Bem-vindo ao Smart Forms</Text>
        <Text style={styles.subtitle}>Seus formulários aparecerão aqui.</Text>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginTop: 20,
    textAlign: 'center'
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center'
  }
});