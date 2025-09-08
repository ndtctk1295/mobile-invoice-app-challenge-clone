import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '../ThemedText';

interface ErrorMessageProps {
  children?: string;
  visible?: boolean;
}

export function ErrorMessage({ children, visible = false }: ErrorMessageProps) {
  if (!visible || !children) return null;
  
  return (
    <ThemedText style={styles.errorText}>
      {children}
    </ThemedText>
  );
}

const styles = StyleSheet.create({
  errorText: {
    fontSize: 12,
    color: '#EC5757',
    marginTop: 4,
    fontWeight: '400',
  },
});
