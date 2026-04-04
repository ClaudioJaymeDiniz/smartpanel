{/*
import React, { useState } from 'react';
import { View, Text, Button, Switch, StyleSheet, ScrollView } from 'react-native';
import { THEME } from '../../styles/theme';
import CustomInput from '../common/CustomInput';

// Definimos a interface para os campos que vêm do JSON do backend
interface Field {
  name?: string; // O backend geralmente precisa de um 'slug' ou 'id' único por campo
  label: string;
  type: string; // 'text', 'number', 'boolean', 'select', etc.
  required: boolean;
  options?: string[];
  optionsRaw?: string; 
}

interface Props {
  structure: Field[];
  onSubmit: (data: Record<string, any>) => void;
  initialData?: Record<string, any>;
}

export default function DynamicForm({ structure, onSubmit, initialData = {} }: Props) {
  // Tipamos o estado para aceitar chaves de string e valores de qualquer tipo
  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  const handleChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {structure.map((field) => (
        <View key={field.name} style={styles.fieldContainer}>
          
          {/* Renderização de Texto ou Número usando seu CustomInput 
          {(field.type === 'text' || field.type === 'number') && (
            <CustomInput
              label={field.label}
              value={String(formData[field.name] || '')}
              onChangeText={(text) => handleChange(field.name, text)}
              keyboardType={field.type === 'number' ? 'numeric' : 'default'}
              placeholder={field.placeholder}
            />
          )}

          {/* Renderização de Booleano (Switch) 
          {field.type === 'boolean' && (
            <View style={styles.switchRow}>
              <Text style={styles.booleanLabel}>{field.label}</Text>
              <Switch
                value={!!formData[field.name]}
                onValueChange={(val) => handleChange(field.name, val)}
                trackColor={{ false: '#CBD5E0', true: THEME.colors.secondary }}
                thumbColor={formData[field.name] ? THEME.colors.primary : '#F4F3F4'}
              />
            </View>
          )}
        </View>
      ))}

      <View style={styles.buttonContainer}>
        <Button 
          title="Enviar Coleta" 
          color={THEME.colors.primary} 
          onPress={() => onSubmit(formData)} 
        />
      </View>
    </ScrollView>
  );
}
}
const styles = StyleSheet.create({
  container: { 
    padding: THEME.spacing.md,
    backgroundColor: THEME.colors.background 
  },
  fieldContainer: { 
    marginBottom: THEME.spacing.sm 
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: THEME.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  booleanLabel: {
    fontFamily: 'Jakarta-Medium',
    fontSize: 16,
    color: THEME.colors.textPrimary,
  },
  buttonContainer: {
    marginTop: THEME.spacing.xl,
  }
});
*/}