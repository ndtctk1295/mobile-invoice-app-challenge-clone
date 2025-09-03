import { useLocalSearchParams, router } from 'expo-router';
import React, { useMemo } from 'react';
import { Alert } from 'react-native';
import { useInvoices } from '@/hooks/useInvoices';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { InvoiceForm, FormValues } from '@/components/InvoiceForm';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { invoices, loading } = useInvoices();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const original = useMemo(() => invoices.find(inv => inv.id === id), [invoices, id]);

  const handleSave = (data: FormValues) => {
    // TODO: Implement actual save logic here
    Alert.alert(
      'Success',
      'Invoice has been updated successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
    console.log('Saving invoice:', data);
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Changes',
      'Are you sure you want to discard your changes?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!original) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ThemedText>Invoice not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <InvoiceForm
      initialData={original}
      mode="edit"
      onSubmit={handleSave}
      onCancel={handleCancel}
    />
  );
}

