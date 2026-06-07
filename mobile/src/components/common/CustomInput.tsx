import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  Animated, 
  TextInputProps 
} from 'react-native';
import { THEME } from '../../styles/theme'; // Ajuste o caminho conforme sua estrutura

interface Props extends TextInputProps {
  label: string;
  value: string;
  accentColor?: string;
}

const CustomInput: React.FC<Props> = ({ label, value, accentColor, ...rest }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  // Inicia em 1 se já houver texto (ex: preenchimento automático)
  const animatedValue = useRef(new Animated.Value(value === '' ? 0 : 1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (value === '') {
      Animated.timing(animatedValue, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    top: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [25, 0], // Sobe o label
    }),
    fontSize: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12], // Diminui o label
    }),
    color: animatedValue.interpolate({
      inputRange: [0, 1],
      outputRange: [THEME.colors.textSecondary, accentColor || THEME.colors.primary],
    }),
    fontFamily: isFocused ? 'Jakarta-Bold' : 'Jakarta-Regular',
  };

  return (
    <View style={styles.container}>
      <Animated.Text style={[styles.label, labelStyle]}>
        {label}
      </Animated.Text>
      <TextInput
        {...rest}
        style={[
          styles.input,
          { borderBottomColor: isFocused ? (accentColor || THEME.colors.primary) : THEME.colors.border }
        ]}
        value={value}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder="" 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
    marginBottom: 20,
    width: '100%',
  },
  input: {
    height: 45,
    borderBottomWidth: 2,
    fontSize: 16,
    color: THEME.colors.textPrimary,
    fontFamily: 'Jakarta-Regular',
    paddingVertical: 5,
  },
  label: {
    position: 'absolute',
    left: 0,
  }
});

export default CustomInput;