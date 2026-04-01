import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, Text, View } from 'react-native';

export default function Modal() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Configurações Rápidas</Text>
      <View style={styles.separator} />
      
      <Text style={styles.content}>
        Este é um modal de exemplo para o seu projeto Smart Forms.
      </Text>

      {/* Use a StatusBar para garantir a visibilidade correta no Android/iOS */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
    backgroundColor: '#eee',
  },
  content: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  }
});