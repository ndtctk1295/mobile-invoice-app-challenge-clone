import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DeletePrompt } from '@/components/DeletePrompt';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Invoice } from '@/types/Invoice';
import { useInvoiceData, useInvoiceActions } from '@/hooks/useInvoices';
import { getInvoiceStatusColor, formatInvoiceDate, formatCurrency } from '@/utils/invoiceUtils';

const createStyles = (colors: typeof Colors.light, colorScheme: 'light' | 'dark', invoice?: Invoice) => {
  const statusStyle = invoice ? getInvoiceStatusColor(invoice.status, colors, colorScheme) : { bg: 'transparent', dot: 'transparent', text: colors.text };
  
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.text,
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    color: colors.muted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
  },
  statusBadgeWithColor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 6,
    backgroundColor: statusStyle.bg,
  },
  statusDotWithColor: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    backgroundColor: statusStyle.dot,
  },
  statusTextWithColor: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: statusStyle.text,
  },
  detailsCard: {
    borderRadius: 8,
    padding: 24,
    marginBottom: 56,
    backgroundColor: colors.cardBackground,
  },
  cardHeader: {
    marginBottom: 30,
  },
  invoiceId: {
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.8,
    fontWeight: '700',
    marginBottom: 4,
    color: colors.text,
  },
  invoiceIdPrefix: {
    color: colors.muted,
  },
  description: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    color: colors.muted,
  },
  addressSection: {
    marginBottom: 31,
  },
  address: {
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: -0.23,
    color: colors.muted,
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 31,
  },
  infoColumn: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: -0.23,
    marginBottom: 12,
    color: colors.muted,
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.31,
    fontWeight: '700',
    color: colors.text,
  },
  billToSection: {
    marginBottom: 31,
  },
  clientName: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.31,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 8,
    color: colors.text,
  },
  sentToSection: {
    marginBottom: 38,
  },
  email: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.31,
    fontWeight: '700',
    marginTop: 12,
    color: colors.text,
  },
  itemsSection: {
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.inputBackground,
  },
  itemsContainer: {
    padding: 24,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  itemLeft: {
    flex: 1,
  },
  itemName: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    marginBottom: 8,
    color: colors.text,
  },
  itemQuantity: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: colors.muted,
  },
  itemTotal: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: colors.text,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colorScheme === 'dark' ? '#0C0E16' : '#373B53',
  },
  totalLabel: {
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: -0.23,
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: -0.42,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 21,
    gap: 8,
    backgroundColor: colors.cardBackground,
  },
  actionButton: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 15,
    minWidth: 73,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colorScheme === 'dark' ? '#252945' : '#F9FAFE',
  },
  editButtonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: colors.muted,
  },
  deleteButton: {
    backgroundColor: '#EC5757',
  },
  deleteButtonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  primaryButton: {
    backgroundColor: '#7C5DFA',
  },
  primaryButtonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  statusPaid: {
    backgroundColor: 'rgba(51, 214, 159, 0.06)',
  },
  statusPending: {
    backgroundColor: 'rgba(255, 143, 0, 0.06)',
  },
  statusDraft: {
    backgroundColor: colorScheme === 'dark' ? 'rgba(223, 227, 250, 0.06)' : 'rgba(55, 59, 83, 0.06)',
  },
  });
};

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  
  const { invoices, isLoading, isLoaded, initializeStore } = useInvoiceData();
  const { deleteInvoice, markAsPaid } = useInvoiceActions();
  
  // Find the specific invoice by ID
  const invoice = invoices.find(inv => inv.id === id);
  
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);


  const styles = useMemo(() => createStyles(colors, colorScheme ?? 'light', invoice), [colors, colorScheme, invoice]);

  useEffect(() => {
    if (!isLoaded) {
      initializeStore();
    }
  }, [isLoaded, initializeStore]);

  const handleEdit = () => {
    router.push(`/invoice/edit/${id}`);
  };

  const handleDelete = () => {
    setShowDeletePrompt(true);
  };

  const handleConfirmDelete = () => {
    if (!id) return;
    deleteInvoice(id).then(() => {
      setShowDeletePrompt(false);
      router.back();
    });
  };

  const handleCancelDelete = () => {
    setShowDeletePrompt(false);
  };

  const handleMarkAsPaid = () => {
    if (!id) return;
    markAsPaid(id).catch(() => {});
  };

  if (isLoading && !isLoaded) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!invoice) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Invoice not found.</ThemedText>
        </View>
      </ThemedView>
    );
  }


  return (
    <ThemedView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Bar */}
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <Text style={styles.statusLabel}>Status</Text>
            <View style={styles.statusBadgeWithColor}>
              <View style={styles.statusDotWithColor} />
              <Text style={styles.statusTextWithColor}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoice Details Card */}
        <View style={styles.detailsCard}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.invoiceId}>
                <Text style={styles.invoiceIdPrefix}>#</Text>{invoice.id}
              </Text>
              <Text style={styles.description}>
                {invoice.description}
              </Text>
            </View>
          </View>

          {/* Sender Address */}
          <View style={styles.addressSection}>
            <Text style={styles.address}>
              {invoice.senderAddress.street}{'\n'}
              {invoice.senderAddress.city}{'\n'}
              {invoice.senderAddress.postCode}{'\n'}
              {invoice.senderAddress.country}
            </Text>
          </View>

          {/* Invoice Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Invoice Date</Text>
              <Text style={styles.infoValue}>
                {formatInvoiceDate(invoice.createdAt)}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={styles.infoLabel}>Payment Due</Text>
              <Text style={styles.infoValue}>
                {formatInvoiceDate(invoice.paymentDue)}
              </Text>
            </View>
          </View>

          {/* Bill To */}
          <View style={styles.billToSection}>
            <Text style={styles.infoLabel}>Bill To</Text>
            <Text style={styles.clientName}>
              {invoice.clientName}
            </Text>
            <Text style={styles.address}>
              {invoice.clientAddress.street}{'\n'}
              {invoice.clientAddress.city}{'\n'}
              {invoice.clientAddress.postCode}{'\n'}
              {invoice.clientAddress.country}
            </Text>
          </View>

          {/* Sent To */}
          <View style={styles.sentToSection}>
            <Text style={styles.infoLabel}>Sent to</Text>
            <Text style={styles.email}>
              {invoice.clientEmail}
            </Text>
          </View>

          {/* Items */}
          <View style={styles.itemsSection}>
            {/* Items Header - Mobile */}
            <View style={styles.itemsContainer}>
              {invoice.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={styles.itemName}>
                      {item.name}
                    </Text>
                    <Text style={styles.itemQuantity}>
                      {item.quantity} x {formatCurrency(item.price)}
                    </Text>
                  </View>
                  <Text style={styles.itemTotal}>
                    {formatCurrency(item.total)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Amount Due</Text>
              <Text style={styles.totalAmount}>
                {formatCurrency(invoice.total)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={handleEdit}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>

        {invoice.status !== 'paid' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleMarkAsPaid}
          >
            <Text style={styles.primaryButtonText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Delete Confirmation Modal */}
      <DeletePrompt
        visible={showDeletePrompt}
        invoiceId={invoice?.id || ''}
        onCancel={handleCancelDelete}
        onDelete={handleConfirmDelete}
      />
    </ThemedView>
  );
}

