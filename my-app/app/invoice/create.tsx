import React from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { InvoiceForm, FormValues } from '@/components/InvoiceForm';

export default function CreateInvoiceScreen() {
  const handleCreate = (data: FormValues) => {
    // TODO: Implement actual create logic here
    Alert.alert(
      'Success',
      'New invoice has been created successfully!',
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]
    );
    console.log('Creating new invoice:', data);
  };

  const handleCancel = () => {
    Alert.alert(
      'Discard Invoice',
      'Are you sure you want to discard this new invoice?',
      [
        {
          text: 'Continue Editing',
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

  return (
    <InvoiceForm
      mode="create"
      onSubmit={handleCreate}
      onCancel={handleCancel}
    />
  );
}
