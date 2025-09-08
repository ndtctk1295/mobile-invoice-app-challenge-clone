import React, { useMemo } from 'react';
import { TextInput as RNTextInput, StyleSheet, TextInputProps, useColorScheme } from 'react-native';
import { Colors } from '@/constants/Colors';

interface CustomTextInputProps extends TextInputProps {
  hasLeftIcon?: boolean;
  hasRightIcon?: boolean;
  disabled?: boolean;
  compact?: boolean;
  error?: boolean;
}

export function CustomTextInput({ 
  hasLeftIcon = false, 
  hasRightIcon = false, 
  disabled = false, 
  compact = false,
  error = false,
  style,
  ...props 
}: CustomTextInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const inputStyles = useMemo(() => [
    styles.input,
    {
      backgroundColor: disabled ? 'transparent' : colors.inputBackground,
      color: disabled ? colors.muted : colors.text,
      borderColor: error 
        ? colors.danger 
        : disabled 
          ? 'transparent' 
          : colors.border,
      paddingLeft: hasLeftIcon ? 50 : 14,
      paddingRight: hasRightIcon ? 50 : 14,
    },
    compact && styles.compact,
    disabled && styles.disabled,
    error && styles.error,
    style,
  ], [colors, disabled, compact, error, hasLeftIcon, hasRightIcon, style]);

  return (
    <RNTextInput
      {...props}
      editable={!disabled}
      placeholderTextColor={colors.muted}
      style={inputStyles}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  compact: {
    paddingVertical: 10,
    fontSize: 13,
  },
  disabled: {
    opacity: 0.6,
  },
  error: {
    borderWidth: 1.5,
  },
});
