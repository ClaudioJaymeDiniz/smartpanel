import { Stack } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { Container } from '@/src/components/common/Container';

export default function Settings() {
  return (
    <>
      {/* Título da aba de configurações */}
      <Stack.Screen options={{ title: 'Configurações' }} />
      
      <Container>
        <Text style={styles.title}>Ajustes do Sistema</Text>
        <Text style={styles.info}>Versão do App: 1.0.0</Text>
        <Text style={styles.info}>Desenvolvido por: Claudio Jayme</Text>
      </Container>
    </>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center'
  },
  info: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
    textAlign: 'center'
  }
});