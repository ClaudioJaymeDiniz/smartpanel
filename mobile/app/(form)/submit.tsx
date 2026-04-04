{/*import { useState } from 'react';
import { View, Text, TextInput, Button, Switch, StyleSheet } from 'react-native';
import DynamicForm from '../../components/forms/DynamicForm';

export default function DynamicForm({ structure, onSubmit }) {
  const [formData, setFormData] = useState({});

  // Função para atualizar o estado de forma dinâmica
  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  return (
    <View style={styles.container}>
      {structure.map((field: any) => (
        <View key={field.name} style={styles.fieldContainer}>
          <Text style={styles.label}>{field.label}</Text>
          */}
          {/* Renderização Condicional baseada no tipo do campo no JSON */} {/*
          {field.type === 'text' && (
            <TextInput
              style={styles.input}
              placeholder={field.placeholder}
              onChangeText={(text) => handleChange(field.name, text)}
            />
          )}

          {field.type === 'number' && (
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              onChangeText={(text) => handleChange(field.name, text)}
            />
          )}

          {field.type === 'boolean' && (
            <Switch
              value={formData[field.name] || false}
              onValueChange={(val) => handleChange(field.name, val)}
            />
          )}
        </View>
      ))}

      <Button title="Enviar Coleta" onPress={() => onSubmit(formData)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  fieldContainer: { marginBottom: 20 },
  label: { fontSize: 16, fontWeight: '500', marginBottom: 5 },
  input: { borderBottomWidth: 1, borderColor: '#ccc', padding: 8 }
});

*/}