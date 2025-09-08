import React, { useEffect, useState, useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useForm, Controller, useFieldArray, type SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DatePicker } from '@/components/DatePicker';
import { LabeledInput } from '@/components/LabeledInput';
import { CalendarIcon } from '@/components/atoms/CalendarIcon';
import { Colors } from '@/constants/Colors';
import { Invoice } from '@/types/Invoice';
import { formatCurrency, calculateItemTotal, generateInvoiceId } from '@/utils/invoiceUtils';


// Zod schema and derived form values type
const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  postCode: z.string().min(1, 'Post code is required'),
  country: z.string().min(1, 'Country is required'),
});

const ItemSchema = z.object({
  name: z.string().min(1, 'Item name is required'),
  quantity: z.number().min(1, 'Qty must be at least 1'),
  price: z.number().min(0, 'Price must be at least 0'),
  total: z.number().min(0),
});

const InvoiceSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().refine(v => !isNaN(Date.parse(v)), { message: 'Invalid date' }),
  paymentDue: z.string(),
  description: z.string().min(1, 'Project description is required'),
  paymentTerms: z.number().int().positive(),
  clientName: z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Invalid email address'),
  status: z.enum(['draft', 'pending', 'paid']),
  senderAddress: AddressSchema,
  clientAddress: AddressSchema,
  items: z.array(ItemSchema).min(1, 'At least one item is required'),
  total: z.number().min(0),
});

export type FormValues = z.infer<typeof InvoiceSchema>;

interface InvoiceFormProps {
  initialData?: Invoice | null;
  mode: 'create' | 'edit';
  onSubmit: (data: FormValues) => void;
  onSaveAsDraft?: (data: FormValues) => void;
  onCancel?: () => void;
  isLoading?: boolean;
}



export function InvoiceForm({ initialData, mode, onSubmit, onSaveAsDraft, onCancel, isLoading }: InvoiceFormProps) {
  const colorScheme  = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showTerms, setShowTerms] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const styles = useMemo(() => createInvoiceFormStyles(colors), [colors]);

  const { control, handleSubmit, reset, watch, getValues, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(InvoiceSchema),
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
  // Keep paymentDue in sync when createdAt or paymentTerms change
  useEffect(() => {
    if (!values.createdAt || !values.paymentTerms) return;
    const createdDate = new Date(values.createdAt);
    const dueDate = new Date(createdDate);
    dueDate.setDate(createdDate.getDate() + Number(values.paymentTerms || 0));
    const paymentDue = dueDate.toISOString().split('T')[0];
    // Avoid infinite loop by only updating when changed
    if (values.paymentDue !== paymentDue) {
      setValue('paymentDue', paymentDue, { shouldValidate: false, shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.createdAt, values.paymentTerms]);

  const recalcTotal = (items: FormValues['items']) => items.reduce((sum, it) => sum + (Number(it.total) || 0), 0);

  const onAddItem = () => {
    append({ name: '', quantity: 1, price: 0, total: 0 }); // export def
  };

  const onRemoveItem = (index: number) => remove(index);

  const handleFormSubmit: SubmitHandler<FormValues> = (data) => {
    // Recalculate total before submitting
    const finalData = {
      ...data,
      total: recalcTotal(data.items),
    } as FormValues;
    onSubmit(finalData);
  };

  const title = mode === 'create' ? `New Invoice` : `Edit #${values.id}`;
  return (
    <View style={StyleSheet.flatten([styles.container, styles.containerWithBg])}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentStyle}
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.titleStyle}>{title}</ThemedText>
        {/* Bill From */}
        <Section title="Bill From">
          <Controller
            control={control}
            name="senderAddress.street"
            render={({ field: { onChange, value } }) => (
              <LabeledInput 
                label="Street Address" 
                value={value} 
                onChangeText={onChange}
                errorMessage={errors.senderAddress?.street?.message}
              />
            )}
            
          />
          <View style={styles.formRow}> {/* TODO: styling nêus muốn dùng kiẻu tailưind thì cho ra global */}
            <View style={styles.flexOne}> {/* TODO: nghĩ lại naming cho class */}
              <Controller control={control} name="senderAddress.city" render={({ field: { onChange, value } }) => (
                <LabeledInput 
                  label="City" 
                  value={value} 
                  onChangeText={onChange} 
                  compact 
                  errorMessage={errors.senderAddress?.city?.message}
                />
              )} />
            </View>
            <View style={styles.flexOne}>
              <Controller control={control} name="senderAddress.postCode" render={({ field: { onChange, value } }) => (
                <LabeledInput 
                  label="Post Code" 
                  value={value} 
                  onChangeText={onChange} 
                  compact 
                  errorMessage={errors.senderAddress?.postCode?.message}
                />
              )} />
            </View>
          </View>
          <View style={styles.inputSpacing}>
            <Controller control={control} name="senderAddress.country" render={({ field: { onChange, value } }) => (
              <LabeledInput 
                label="Country" 
                value={value} 
                onChangeText={onChange} 
                errorMessage={errors.senderAddress?.country?.message}
              />
            )}
            />
          </View>
        </Section>

        {/* Bill To */}
        <Section title="Bill To" style={styles.sectionSpacing}>
          <Controller control={control} name="clientName" render={({ field: { onChange, value } }) => (
            <LabeledInput 
              label="Client's Name" 
              value={value} 
              onChangeText={onChange} 
              errorMessage={errors.clientName?.message}
            />
          )} />
          <Controller control={control} name="clientEmail" render={({ field: { onChange, value } }) => (
            <LabeledInput 
              label="Client's Email" 
              value={value} 
              onChangeText={onChange} 
              keyboardType="email-address" 
              errorMessage={errors.clientEmail?.message}
            />
          )} />
          <Controller control={control} name="clientAddress.street" render={({ field: { onChange, value } }) => (
            <LabeledInput 
              label="Street Address" 
              value={value} 
              onChangeText={onChange} 
              errorMessage={errors.clientAddress?.street?.message}
            />
          )} />
          <View style={styles.formRow}>
            <View style={styles.flexOne}>
              <Controller control={control} name="clientAddress.city" render={({ field: { onChange, value } }) => (
                <LabeledInput 
                  label="City" 
                  value={value} 
                  onChangeText={onChange} 
                  compact 
                  errorMessage={errors.clientAddress?.city?.message}
                />
              )} />
            </View>
            <View style={styles.flexOne}>
              <Controller control={control} name="clientAddress.postCode" render={({ field: { onChange, value } }) => (
                <LabeledInput 
                  label="Post Code" 
                  value={value} 
                  onChangeText={onChange} 
                  compact 
                  errorMessage={errors.clientAddress?.postCode?.message}
                />
              )} />
            </View>
          </View>
          <View style={styles.inputSpacing}>
            <Controller control={control} name="clientAddress.country" render={({ field: { onChange, value } }) => (
              <LabeledInput 
                label="Country" 
                value={value} 
                onChangeText={onChange} 
                errorMessage={errors.clientAddress?.country?.message}
              />
            )} />
          </View>

          {/* Invoice Date */}
          <View style={styles.inputSpacing}>
            <Controller control={control} name="createdAt" render={({ field: { onChange, value } }) => {
              const displayValue = value ? format(new Date(value), 'd MMM yyyy') : '';
              const isEditMode = mode === 'edit';
              return (
                <LabeledInput 
                  label="Invoice Date" 
                  value={displayValue} 
                  onChangeText={() => {}} // Read-only, use calendar picker
                  rightIcon={<CalendarIcon />}
                  onRightIconPress={isEditMode ? undefined : () => setShowDatePicker(true)}
                  readOnly
                  disabled={isEditMode}
                  errorMessage={errors.createdAt?.message}
                />
              );
            }} />
          </View>

          {/* Payment Terms */}
          <View style={styles.inputSpacing}>
            <ThemedText style={styles.paymentTermsLabel}>Payment Terms</ThemedText>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setShowTerms(s => !s)}
              style={styles.inputWithColors}>
              <ThemedText style={styles.paymentTermsText}>Net {values.paymentTerms} Days</ThemedText>
              <ThemedText style={styles.paymentTermsArrow}>▼</ThemedText>
            </TouchableOpacity>
            {showTerms && (
              <ThemedView style={styles.dropdownWithColors}>
                {[1, 7, 14, 30].map(v => (
                  <TouchableOpacity key={v} onPress={() => { setValue('paymentTerms', v, { shouldValidate: true, shouldDirty: true }); setShowTerms(false); }} style={styles.dropdownItem}>
                    <ThemedText>Net {v} Days</ThemedText>
                  </TouchableOpacity>
                ))}
              </ThemedView>
            )}
          </View>

          {/* Description */}
          <View style={styles.inputSpacing}>
            <Controller control={control} name="description" render={({ field: { onChange, value } }) => (
              <LabeledInput 
                label="Project Description" 
                value={value} 
                onChangeText={onChange} 
                errorMessage={errors.description?.message}
              />
            )} />
          </View>
        </Section>

        {/* Item List */}
        <Section title="Item List" style={styles.sectionSpacing}>
          {itemFields.length === 0 && (
            <ThemedText style={styles.itemListSpacing}>No items. Add one below.</ThemedText>
          )}
          {itemFields.map((it, idx) => (
            <View key={it.key} style={styles.itemContainer}>
              {/* Item Name - Full Width */}
              <View style={styles.itemNameContainer}>
                <Controller control={control} name={`items.${idx}.name` } render={({ field: { onChange, value } }) => (
                  <LabeledInput 
                    label="Item Name" 
                    value={String(value ?? '')} 
                    onChangeText={onChange} 
                    errorMessage={errors.items?.[idx]?.name?.message}
                  />
                )} />
              </View>
              
              {/* Qty, Price, Total Row */}
              <View style={styles.itemRow}>
                <View style={styles.qtyContainer}>
                  <Controller control={control} name={`items.${idx}.quantity` } render={({ field: { onChange, value } }) => (
                    <LabeledInput
                      compact
                      label="Qty."
                      value={String(value ?? '')}
                      onChangeText={(t) => {
                        const num = Number(t);
                        onChange(num);
                        const price = Number(getValues(`items.${idx}.price`) || 0);
                        const total = calculateItemTotal(num || 0, price);
                        setValue(`items.${idx}.total`, total, { shouldValidate: false, shouldDirty: true });
                      }}
                      keyboardType="numeric"
                      errorMessage={errors.items?.[idx]?.quantity?.message}
                    />
                  )} />
                </View>
                <View style={styles.priceContainer}>
                  <Controller control={control} name={`items.${idx}.price` } render={({ field: { onChange, value } }) => (
                    <LabeledInput
                      compact
                      label="Price"
                      value={String(value ?? '')}
                      onChangeText={(t) => {
                        const num = Number(t);
                        onChange(num);
                        const qty = Number(getValues(`items.${idx}.quantity`) || 0);
                        const total = calculateItemTotal(qty, num || 0);
                        setValue(`items.${idx}.total`, total, { shouldValidate: false, shouldDirty: true });
                      }}
                      keyboardType="decimal-pad"
                      errorMessage={errors.items?.[idx]?.price?.message}
                    />
                  )} />
                </View>
                <View style={styles.totalContainer}>
                  <View style={styles.totalLabelContainer}>
                    <ThemedText style={styles.totalLabelWithColor}>Total</ThemedText>
                  </View>
                  <View style={styles.totalValueContainer}>
                    <ThemedText style={styles.totalValueWithColor}>
                      {formatCurrency(Number(values.items?.[idx]?.total ?? 0))}
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
                    <ThemedText style={styles.deleteIconWithColor}>🗑</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
          {errors.items && typeof errors.items?.message === 'string' && (
            <ThemedText style={styles.errorText}>{String(errors.items.message)}</ThemedText>
          )}
          <TouchableOpacity onPress={onAddItem} activeOpacity={0.9}
            style={styles.addButtonWithColors}>
            <ThemedText style={styles.addButtonText}>+ Add New Item</ThemedText>
          </TouchableOpacity>
          <View style={styles.totalContainerSection}>
            <ThemedText type="subtitle">
              Total: {
                formatCurrency(
                  Number(
                    recalcTotal(values.items || [])
                  )
                )
              }
            </ThemedText>
          </View>
        </Section>
        <View style={styles.heightSpacer} />
      </ScrollView>
      {/* Action Buttons */}
      <View style={styles.actionButtonsWithBg}> 
        {mode === 'create' ? (
          <>
            {onCancel && (
              <TouchableOpacity 
                onPress={onCancel}
                style={styles.cancelButtonWithColors}
                disabled={isLoading}
              >
                <ThemedText style={styles.cancelButtonText}>Discard</ThemedText>
              </TouchableOpacity>
            )}
            {onSaveAsDraft && (
              <TouchableOpacity 
                onPress={() => {
                  const draft = getValues();
                  const finalDraft = { ...draft, total: recalcTotal(draft.items || []) } as any;
                  onSaveAsDraft(finalDraft);
                }}
                style={styles.draftButtonWithColors}
                disabled={isLoading}
              >
                <ThemedText style={styles.draftButtonText}>
                  {isLoading ? 'Saving...' : 'Save as Draft'}
                </ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleSubmit(handleFormSubmit)}
              style={styles.saveButtonWithColors}
              disabled={isLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? 'Sending...' : 'Save & Send'}
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {onCancel && (
              <TouchableOpacity 
                onPress={onCancel}
                style={styles.cancelButtonWithColors}
                disabled={isLoading}
              >
                <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleSubmit(handleFormSubmit)}
              style={styles.saveButtonWithColors}
              disabled={isLoading}
            >
              <ThemedText style={styles.saveButtonText}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </ThemedText>
            </TouchableOpacity>
          </>
        )}
      </View>
      <DatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onSelectDate={(date) => {
          setValue('createdAt', date, { shouldValidate: true, shouldDirty: true });
        }}
        selectedDate={values.createdAt}
      />
    </View>
  );
}

function Section({ title, children, style  }: { 
  title?: string; 
  children: React.ReactNode; 
  style?: any;
}) {
  const colorScheme  = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createInvoiceFormStyles(colors), [colors]);
  return (
    <View style={[{ marginBottom: 16 }, style]}>
      {title ? (
        <ThemedText style={styles.titleStyle}>{title}</ThemedText>
      ) : null}
      {children}
    </View>
  );
}

const createInvoiceFormStyles = (colors: any) => StyleSheet.create({
  // Base container styles
  container: { 
    flex: 1 
  },
  scrollView: { 
    flex: 1 
  },
  
  // Container and layout styles
  containerWithBg: {
    backgroundColor: colors.background,
  },
  scrollContentStyle: {
    padding: 20,
  },
  titleStyle: {
    marginBottom: 12,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  
  // Form layout styles
  formRow: {
    flexDirection: 'row' ,
    gap: 8,
    marginTop: 4,
  },
  flexOne: {
    flex: 1,
  },
  inputSpacing: {
    marginTop: 4,
  },
  
  // Text styles
  errorText: {
    color: '#EC5757',
    marginTop: 4,
  },
  sectionTitle: {
    marginBottom: 16,
    fontSize: 12,
    fontWeight: '700' ,
    color: '#7C5DFA',
    letterSpacing: 0.8,
  },
  
  // Input and dropdown styles
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inputWithColors: {
    backgroundColor: colors.inputBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row' ,
    justifyContent: 'space-between' ,
    alignItems: 'center' ,
  },
  dropdown: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden' ,
  },
  dropdownWithColors: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 8,
    overflow: 'hidden' ,
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  paymentTermsText: {
    fontSize: 14,
    fontWeight: '500' ,
  },
  paymentTermsArrow: {
    color: colors.muted,
  },
  paymentTermsLabel: {
    color: colors.muted,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: '500' ,
  },
  
  // Item list styles
  itemListSpacing: {
    color: colors.muted,
    marginBottom: 8,
  },
  itemNameContainer: {
    marginBottom: 16,
  },
  itemContainer: {
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row' ,
    alignItems: 'flex-start' ,
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
    alignItems: 'flex-end' ,
  },
  totalContainerSection: {
    marginTop: 24,
    alignItems: 'flex-end' ,
  },
  totalLabelContainer: {
    height: 18,
    marginBottom: 6,
    justifyContent: 'center' ,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500' ,
    color: '#7E88C3',
  },
  totalLabelWithColor: {
    fontSize: 12,
    fontWeight: '500' ,
    color: colors.muted,
  },
  totalValueContainer: {
    height: 34, 
    justifyContent: 'center' ,
    paddingHorizontal: 14, 
    backgroundColor: 'transparent',
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '700' ,
    lineHeight: 20,
  },
  totalValueWithColor: {
    fontSize: 14,
    fontWeight: '700' ,
    lineHeight: 20,
    color: colors.text,
  },
  deleteButton: {
    width: 40,
    marginLeft: 8,
    alignItems: 'center' ,
  },
  deleteButtonContainer: {
    height: 18, 
    marginBottom: 6,
  },
  deleteButtonContent: {
    height: 34,
    justifyContent: 'center' ,
    alignItems: 'center' ,
    padding: 8,
  },
  deleteIcon: {
    fontSize: 16,
  },
  deleteIconWithColor: {
    fontSize: 16,
    color: colors.muted,
  },
  addButton: {
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center' ,
    marginTop: 16,
  },
  addButtonWithColors: {
    backgroundColor: colors.inputBackground,
    borderRadius: 24,
    paddingVertical: 14,
    alignItems: 'center' ,
    marginTop: 16,
  },
  addButtonText: {
    color: colors.text,
    fontWeight: '700' ,
    fontSize: 14,
  },
  
  // Action button styles
  actionButtons: {
    justifyContent: 'center' , 
    alignItems: 'stretch' ,
    flexDirection: 'row' ,
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 8,
  },
  actionButtonsWithBg: {
    backgroundColor: colors.background,
    justifyContent: 'center' ,
    alignItems: 'stretch' ,
    flexDirection: 'row' ,
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center' ,
    justifyContent: 'center' ,
    minHeight: 48,
  },
  cancelButton: {
    flex: 2,
  },
  cancelButtonWithColors: {
    backgroundColor: colors.inputBackground,
    flex: 2,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center' ,
    justifyContent: 'center' ,
    minHeight: 48,
  },
  saveButton: {
    flex: 3,
    marginLeft: 8,
  },
  saveButtonWithColors: {
    backgroundColor: colors.primary,
    flex: 3,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center' ,
    justifyContent: 'center' ,
    minHeight: 48,
  },
  draftButton: {
    flex: 2,
    marginLeft: 8,
  },
  draftButtonWithColors: {
    backgroundColor: colors.inputBackground,
    flex: 2,
    marginLeft: 8,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center' ,
    justifyContent: 'center' ,
    minHeight: 48,
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700' ,
  },
  cancelButtonText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700' ,
  },
  draftButtonText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700' ,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700' ,
  },
  heightSpacer: {
    height: 24,
  },
});