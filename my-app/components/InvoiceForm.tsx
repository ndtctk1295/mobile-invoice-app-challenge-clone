import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import { format } from 'date-fns';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DatePicker } from '@/components/DatePicker';
import { LabeledInput } from '@/components/LabeledInput';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Invoice } from '@/types/Invoice';

export type FormValues = {
  id: string;
  createdAt: string;
  paymentDue: string;
  description: string;
  paymentTerms: number;
  clientName: string;
  clientEmail: string;
  status: 'draft' | 'pending' | 'paid';
  senderAddress: { street: string; city: string; postCode: string; country: string };
  clientAddress: { street: string; city: string; postCode: string; country: string };
  items: Array<{ name: string; quantity: number; price: number; total: number }>;
  total: number;
};

interface InvoiceFormProps {
  initialData?: Invoice | null;
  mode: 'create' | 'edit';
  onSubmit: (data: FormValues) => void;
  onCancel?: () => void;
}

export function InvoiceForm({ initialData, mode, onSubmit, onCancel }: InvoiceFormProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showTerms, setShowTerms] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const generateInvoiceId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const letters = chars.substring(0, 26);
    const numbers = chars.substring(26);
    
    let result = '';
    // 2 random letters
    for (let i = 0; i < 2; i++) {
      result += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // 4 random numbers
    for (let i = 0; i < 4; i++) {
      result += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return result;
  };

  const { control, handleSubmit, reset, watch } = useForm<FormValues>({
    defaultValues: {
      id: mode === 'create' ? generateInvoiceId() : '',
      createdAt: mode === 'create' ? new Date().toISOString().split('T')[0] : '',
      paymentDue: '',
      description: '',
      paymentTerms: 30,
      clientName: '',
      clientEmail: '',
      status: 'draft',
      senderAddress: { street: '', city: '', postCode: '', country: '' },
      clientAddress: { street: '', city: '', postCode: '', country: '' },
      items: [],
      total: 0,
    },
  });

  // Field array for items
  const { fields: itemFields, append, remove, update } = useFieldArray({
    control,
    name: 'items',
    keyName: 'key',
  });

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset(initialData);
    }
  }, [initialData, mode, reset]);

  const values = watch();
  const recalcTotal = (items: FormValues['items']) => items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  const onAddItem = () => {
    append({ name: '', quantity: 1, price: 0, total: 0 });
  };

  const onRemoveItem = (index: number) => remove(index);

  const onUpdateItemField = (index: number, patch: Partial<{ name: string; quantity: number; price: number }>) => {
    const current = values.items?.[index] ?? { name: '', quantity: 0, price: 0, total: 0 };
    const next = { ...current, ...patch } as any;
    const qty = Number(next.quantity) || 0;
    const price = Number(next.price) || 0;
    next.total = Number((qty * price).toFixed(2));
    update(index, next);
  };

  const handleFormSubmit = (data: FormValues) => {
    // Recalculate total before submitting
    const finalData = {
      ...data,
      total: recalcTotal(data.items),
    };
    onSubmit(finalData);
  };

  const title = mode === 'create' ? `New Invoice` : `Edit #${values.id}`;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={{ padding: 20 }} 
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={{ marginBottom: 12 }}>{title}</ThemedText>

        {/* Bill From */}
        <Section title="Bill From">
          <Controller
            control={control}
            name="senderAddress.street"
            render={({ field: { onChange, value } }) => (
              <LabeledInput label="Street Address" value={value} onChangeText={onChange} colors={colors} />
            )}
          />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="senderAddress.city" render={({ field: { onChange, value } }) => (
                <LabeledInput label="City" value={value} onChangeText={onChange} colors={colors} compact />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="senderAddress.postCode" render={({ field: { onChange, value } }) => (
                <LabeledInput label="Post Code" value={value} onChangeText={onChange} colors={colors} compact />
              )} />
            </View>
          </View>
          <View style={{ marginTop: 4 }}>
            <Controller control={control} name="senderAddress.country" render={({ field: { onChange, value } }) => (
              <LabeledInput label="Country" value={value} onChangeText={onChange} colors={colors} />
            )}
            />
          </View>
        </Section>

        {/* Bill To */}
        <Section title="Bill To" style={{ marginTop: 24 }}>
          <Controller control={control} name="clientName" render={({ field: { onChange, value } }) => (
            <LabeledInput label="Client's Name" value={value} onChangeText={onChange} colors={colors} />
          )} />
          <Controller control={control} name="clientEmail" render={({ field: { onChange, value } }) => (
            <LabeledInput label="Client's Email" value={value} onChangeText={onChange} colors={colors} keyboardType="email-address" />
          )} />
          <Controller control={control} name="clientAddress.street" render={({ field: { onChange, value } }) => (
            <LabeledInput label="Street Address" value={value} onChangeText={onChange} colors={colors} />
          )} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="clientAddress.city" render={({ field: { onChange, value } }) => (
                <LabeledInput label="City" value={value} onChangeText={onChange} colors={colors} compact />
              )} />
            </View>
            <View style={{ flex: 1 }}>
              <Controller control={control} name="clientAddress.postCode" render={({ field: { onChange, value } }) => (
                <LabeledInput label="Post Code" value={value} onChangeText={onChange} colors={colors} compact />
              )} />
            </View>
          </View>
          <View style={{ marginTop: 4 }}>
            <Controller control={control} name="clientAddress.country" render={({ field: { onChange, value } }) => (
              <LabeledInput label="Country" value={value} onChangeText={onChange} colors={colors} />
            )} />
          </View>

          {/* Invoice Date */}
          <View style={{ marginTop: 4 }}>
            <Controller control={control} name="createdAt" render={({ field: { onChange, value } }) => {
              const displayValue = value ? format(new Date(value), 'd MMM yyyy') : '';
              const isEditMode = mode === 'edit';
              return (
                <LabeledInput 
                  label="Invoice Date" 
                  value={displayValue} 
                  onChangeText={() => {}} // Read-only, use calendar picker
                  colors={colors} 
                  hasCalendarIcon
                  onCalendarPress={isEditMode ? undefined : () => setShowDatePicker(true)}
                  readOnly
                  disabled={isEditMode}
                />
              );
            }} />
          </View>

          {/* Payment Terms */}
          <View style={{ marginTop: 4 }}>
            <ThemedText style={{ 
              color: colors.muted, 
              marginBottom: 6, 
              fontSize: 12,
              fontWeight: '500'
            }}>Payment Terms</ThemedText>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowTerms(s => !s)}
              style={[styles.input, { 
                backgroundColor: colors.inputBackground, 
                borderColor: colors.border,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
              }]}>
              <ThemedText style={{ fontSize: 14, fontWeight: '500' }}>Net {values.paymentTerms} Days</ThemedText>
              <ThemedText style={{ color: colors.muted }}>▼</ThemedText>
            </TouchableOpacity>
            {showTerms && (
              <ThemedView style={[styles.dropdown, { backgroundColor: colors.cardBackground, borderColor: colors.border }]}>
                {[1, 7, 14, 30].map(v => (
                  <TouchableOpacity key={v} onPress={() => { reset({ ...values, paymentTerms: v }); setShowTerms(false); }} style={styles.dropdownItem}>
                    <ThemedText>Net {v} Days</ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            )}
          </View>

          {/* Description */}
          <View style={{ marginTop: 4 }}>
            <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
              <LabeledInput label="Project Description" value={value} onChangeText={onChange} colors={colors} />
            )} />
          </View>
        </Section>

        {/* Item List */}
        <Section title="Item List" style={{ marginTop: 24 }}>
          {itemFields.length === 0 && (
            <ThemedText style={{ color: colors.muted, marginBottom: 8 }}>No items. Add one below.</ThemedText>
          )}
          {itemFields.map((it, idx) => (
            <View key={it.key} style={[styles.itemContainer,]}>
              {/* Item Name - Full Width */}
              <View style={{ marginBottom: 16 }}>
                <Controller control={control} name={`items.${idx}.name` as const} render={({ field: { onChange, value } }) => (
                  <LabeledInput label="Item Name" value={String(value ?? '')} onChangeText={(t) => onUpdateItemField(idx, { name: t })} colors={colors} />
                )} />
              </View>
              
              {/* Qty, Price, Total Row */}
              <View style={styles.itemRow}>
                <View style={styles.qtyContainer}>
                  <Controller control={control} name={`items.${idx}.quantity` as const} render={({ field: { onChange, value } }) => (
                    <LabeledInput compact label="Qty." value={String(value ?? '')} onChangeText={(t) => onUpdateItemField(idx, { quantity: Number(t) })} colors={colors} keyboardType="numeric" />
                  )} />
                </View>
                <View style={styles.priceContainer}>
                  <Controller control={control} name={`items.${idx}.price` as const} render={({ field: { onChange, value } }) => (
                    <LabeledInput compact label="Price" value={String(value ?? '')} onChangeText={(t) => onUpdateItemField(idx, { price: Number(t) })} colors={colors} keyboardType="decimal-pad" />
                  )} />
                </View>
                <View style={styles.totalContainer}>
                  <View style={styles.totalLabelContainer}>
                    <ThemedText style={[styles.totalLabel, { color: colors.muted }]}>Total</ThemedText>
                  </View>
                  <View style={styles.totalValueContainer}>
                    <ThemedText style={[styles.totalValue, { color: colors.text }]}>
                      {Number(values.items?.[idx]?.total ?? 0).toFixed(2)}
                    </ThemedText>
                  </View>
                </View>
                <View style={styles.deleteButton}>
                  <View style={styles.deleteButtonContainer} />
                  <TouchableOpacity 
                    onPress={() => onRemoveItem(idx)} 
                    style={styles.deleteButtonContent}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <ThemedText style={[styles.deleteIcon, { color: colors.muted }]}>🗑</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}

          <TouchableOpacity onPress={onAddItem} activeOpacity={0.9}
            style={[styles.addButton, { backgroundColor: colors.inputBackground }]}>
            <ThemedText style={[styles.addButtonText, { color: colors.text }]}>+ Add New Item</ThemedText>
          </TouchableOpacity>

          <View style={{ marginTop: 24, alignItems: 'flex-end' }}>
            <ThemedText type="subtitle">Total: £{Number(recalcTotal(values.items || [])).toFixed(2)}</ThemedText>
          </View>
        </Section>

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Action Buttons */}
      
      <View style={[styles.actionButtons, { backgroundColor: colors.background }]}>
        <View style={{flex: 2}}></View>
        {onCancel && (
          <TouchableOpacity 
            onPress={onCancel}
            style={[styles.button, styles.cancelButton, { backgroundColor: colors.inputBackground }]}
          >
            <ThemedText style={[styles.buttonText, { color: colors.muted }]}>Cancel</ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={handleSubmit(handleFormSubmit)}
          style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
        >
          <ThemedText style={[styles.buttonText, { color: '#FFFFFF' }]}>
            {mode === 'create' ? 'Save Changes' : 'Save Changes'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => {
          reset({ ...values, createdAt: date });
        }}
        selectedDate={values.createdAt}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1 
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionButtons: {
    // flex: 1,
    justifyContent: "center", // vertically center (optional)
    alignItems: "stretch",
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 8,
  },
  button: {
    paddingVertical: 17,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  cancelButton: {
    flex: 1,
    minWidth: 91,
  },
  saveButton: {
    flex: 3,
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
  },
  // Item List Styles
  itemContainer: {
    // borderRadius: 8,
    // borderWidth: 1,
    // padding: 16,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  qtyContainer: {
    width: 60,
  },
  priceContainer: {
    flex: 1,
  },
  totalContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  totalLabelContainer: {
    height: 18, // Match the label height of input fields (12px fontSize + 6px margin)
    marginBottom: 6,
    justifyContent: 'center',
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#7E88C3',
  },
  totalValueContainer: {
    height: 34, // Match the compact input field height
    justifyContent: 'center',
    paddingHorizontal: 14, // Match input field padding
    backgroundColor: 'transparent',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  deleteButton: {
    width: 40,
    marginLeft: 8,
    alignItems: 'center',
  },
  deleteButtonContainer: {
    height: 18, // Match label height for spacing
    marginBottom: 6,
  },
  deleteButtonContent: {
    height: 34, // Match input field height
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
  addButton: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonText: {
    fontWeight: '700',
    fontSize: 14,
  },
});

function Section({ title, children, style }: { title?: string; children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {title ? (
        <ThemedText style={{ 
          marginBottom: 16, 
          fontSize: 12,
          fontWeight: '700',
          color: '#7C5DFA',
          // textTransform: 'uppercase',
          letterSpacing: 0.8
        }}>{title}</ThemedText>
      ) : null}
      {children}
    </View>
  );
}
