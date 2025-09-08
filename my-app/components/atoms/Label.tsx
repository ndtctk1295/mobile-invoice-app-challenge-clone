import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';

interface LabelProps {
  children: string;
  required?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function Label({ children, required = false, disabled = false, compact = false }: LabelProps) {
  return (
    <ThemedText 
      style={StyleSheet.flatten([
        styles.label,
        compact && styles.compact,
        disabled && styles.disabled,
      ])}
    >
      {children}
      {required && <ThemedText style={styles.required}> *</ThemedText>}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
    opacity: 1,
  },
  compact: {
    marginBottom: 4,
    fontSize: 11,
  },
  disabled: {
    opacity: 0.6,
  },
  required: {
    color: '#EC5757',
  },
});
