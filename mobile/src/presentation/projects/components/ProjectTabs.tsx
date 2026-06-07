import React from 'react';
import { View, TouchableOpacity, Text as RNText, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { THEME } from '@/styles/theme';

interface ProjectTabsProps {
  activeSection: 'forms' | 'members';
  setActiveSection: (section: 'forms' | 'members') => void;
  projectColor: string;
}

export function ProjectTabs({ activeSection, setActiveSection, projectColor }: ProjectTabsProps) {
  return (
    <View style={styles.segmentedControl}>
      <TouchableOpacity
        style={[
          styles.segmentButton,
          activeSection === 'forms' && {
            backgroundColor: projectColor,
            borderColor: projectColor,
          },
        ]}
        onPress={() => setActiveSection('forms')}
      >
        <Ionicons
          name="document-text-outline"
          size={16}
          color={activeSection === 'forms' ? '#FFF' : THEME.colors.textSecondary}
        />
        <RNText style={[styles.segmentText, activeSection === 'forms' && styles.segmentTextActive]}>
          Formulários
        </RNText>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.segmentButton,
          activeSection === 'members' && {
            backgroundColor: projectColor,
            borderColor: projectColor,
          },
        ]}
        onPress={() => setActiveSection('members')}
      >
        <Ionicons
          name="people-outline"
          size={16}
          color={activeSection === 'members' ? '#FFF' : THEME.colors.textSecondary}
        />
        <RNText style={[styles.segmentText, activeSection === 'members' && styles.segmentTextActive]}>
          Membros
        </RNText>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  segmentedControl: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.surface,
  },
  segmentText: {
    fontFamily: 'Manrope-SemiBold',
    color: THEME.colors.textSecondary,
  },
  segmentTextActive: {
    color: '#FFF',
  },
});