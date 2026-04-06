import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { THEME } from '@/styles/theme';

interface SmartAlertProps {
  visible: boolean;
  title: string;
  description: string;
  type?: 'info' | 'confirm'; // 'info' só tem OK, 'confirm' tem Cancelar/Confirmar
  onConfirm: () => void;
  onCancel?: () => void;
}

export default function SmartAlert({ visible, title, description, type = 'info', onConfirm, onCancel }: SmartAlertProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.alertBox}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>

          <View style={styles.buttonContainer}>
            {type === 'confirm' && (
              <TouchableOpacity style={[styles.button, styles.cancelBtn]} onPress={onCancel}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity style={[styles.button, styles.confirmBtn]} onPress={onConfirm}>
              <Text style={styles.confirmText}>{type === 'confirm' ? 'Confirmar' : 'Entendido'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  alertBox: { backgroundColor: THEME.colors.surface, borderRadius: 18, padding: 25, alignItems: 'center' },
  title: { ...THEME.fonts.title, fontSize: 20, marginBottom: 10, textAlign: 'center' },
  description: { ...THEME.fonts.body, color: THEME.colors.textSecondary, textAlign: 'center', marginBottom: 25 },
  buttonContainer: { flexDirection: 'row', gap: 10, width: '100%' },
  button: { flex: 1, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmBtn: { backgroundColor: THEME.colors.primary },
  confirmText: { ...THEME.fonts.button },
  cancelBtn: { borderWidth: 1.5, borderColor: THEME.colors.border },
  cancelText: { ...THEME.fonts.body, color: THEME.colors.textSecondary, fontFamily: 'Manrope-SemiBold' },
});