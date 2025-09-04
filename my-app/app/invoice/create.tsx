import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { InvoiceForm, FormValues } from '@/components/InvoiceForm';
import useInvoiceStore from '@/stores/useInvoiceStore';

export default function CreateInvoiceScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const { createInvoice, initializeStore } = useInvoiceStore();

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleSaveAsDraft = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const newInvoice = await createInvoice(data, 'draft', false);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save invoice. Please try again.', [{ text: 'OK' }]);
      console.error('Failed to save draft:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndSend = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const newInvoice = await createInvoice(data, 'pending', true);
      router.back();
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back()
  };

  return (
    <InvoiceForm
      mode="create"
      onSubmit={handleSaveAndSend}
      onSaveAsDraft={handleSaveAsDraft}
      onCancel={handleCancel}
      isLoading={isLoading}
    />
  );
}
