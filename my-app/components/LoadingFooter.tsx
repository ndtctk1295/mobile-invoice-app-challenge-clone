import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

interface LoadingFooterProps {
  isLoading: boolean;
  hasMore: boolean;
}

export default function LoadingFooter({ isLoading, hasMore }: LoadingFooterProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  if (!isLoading && !hasMore) {
    return (
      <View style={styles.footer}>
        <ThemedText style={[styles.endText, { color: colors.muted }]}>
          You've reached the end
        </ThemedText>
      </View>
    );
  }

  if (!isLoading) return null;

  return (
    <View style={styles.footer}>
      <ActivityIndicator size="small" color={colors.primary} />
      <ThemedText style={[styles.loadingText, { color: colors.muted }]}>
        Loading more invoices...
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
  },
  endText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
