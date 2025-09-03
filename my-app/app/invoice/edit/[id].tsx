import { useLocalSearchParams, router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import useInvoiceStore from '@/stores/useInvoiceStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { InvoiceForm, FormValues } from '@/components/InvoiceForm';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';

export default function InvoiceDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const isLoading = useInvoiceStore(s => s.isLoading);
    const isLoaded = useInvoiceStore(s => s.isLoaded);
    const initializeStore = useInvoiceStore(s => s.initializeStore);
    const updateInvoice = useInvoiceStore(s => s.updateInvoice);
    const original = useInvoiceStore().getInvoiceById(id);
    const { colorScheme } = useTheme();
    const colors = Colors[colorScheme ?? 'light'];
    const [isSaving, setIsSaving] = useState(false);

    // Initialize store on component mount
    useEffect(() => {
        if (!isLoaded) {
            initializeStore();
        }
    }, [isLoaded, initializeStore]);

    const handleSave = async (data: FormValues) => {
        setIsSaving(true);
        try {
            const updates: FormValues = {
                ...data,
                // If the original invoice was a draft, promote to pending on save
                status: original?.status === 'draft' ? 'pending' as const : data.status,
            };
            await updateInvoice(id as string, updates);
            //   Alert.alert(
            //     'Success',
            //     original?.status === 'draft' ? 'Invoice has been sent and marked as pending.' : 'Invoice has been updated successfully!',
            //     [
            //       {
            //         text: 'OK',
            //         onPress: () => router.back(),
            //       },
            //     ]
            //   );
            router.back();
        } catch (error) {
            Alert.alert(
                'Error',
                'Failed to update invoice. Please try again.',
                [{ text: 'OK' }]
            );
            console.error('Failed to update invoice:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        router.back()
    };

    if (isLoading && !isLoaded) {
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
            isLoading={isSaving}
        />
    );
}