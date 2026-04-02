import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

interface ContainerProps extends ViewProps {
  children: React.ReactNode;
}

export default function Container({ children, style, ...rest }: ContainerProps) {
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20, // O "respiro" lateral padrão do app
    width: '100%',
  },
});