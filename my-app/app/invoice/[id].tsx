import { useLocalSearchParams, router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import useInvoiceStore from '@/stores/useInvoiceStore';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { DeletePrompt } from '@/components/DeletePrompt';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Invoice } from '@/types/Invoice';

export default function InvoiceDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isLoading = useInvoiceStore(s => s.isLoading);
  const isLoaded = useInvoiceStore(s => s.isLoaded);
  const initializeStore = useInvoiceStore(s => s.initializeStore);
  const deleteInvoice = useInvoiceStore(s => s.deleteInvoice);
  const markAsPaid = useInvoiceStore(s => s.markAsPaid);
  const invoice = useInvoiceStore(s => s.invoices.find(inv => inv.id === id));
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [showDeletePrompt, setShowDeletePrompt] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      initializeStore();
    }
  }, [isLoaded, initializeStore]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return {
          bg: 'rgba(51, 214, 159, 0.06)',
          text: colors.success,
          dot: colors.success
        };
      case 'pending':
        return {
          bg: 'rgba(255, 143, 0, 0.06)',
          text: colors.warning,
          dot: colors.warning
        };
      case 'draft':
        return {
          bg: colorScheme === 'dark' ? 'rgba(223, 227, 250, 0.06)' : 'rgba(55, 59, 83, 0.06)',
          text: colorScheme === 'dark' ? colors.text : '#373B53',
          dot: colorScheme === 'dark' ? colors.text : '#373B53'
        };
      default:
        return {
          bg: 'rgba(136, 142, 176, 0.06)',
          text: colors.muted,
          dot: colors.muted
        };
    }
  };

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
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Loading...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  if (!invoice) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ThemedText style={styles.loadingText}>Invoice not found.</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const statusStyle = getStatusColor(invoice.status);

  return (
    <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Status Bar */}
        <View style={[styles.statusBar, { backgroundColor: colors.cardBackground }]}>
          <View style={styles.statusLeft}>
            <Text style={[styles.statusLabel, { color: colors.muted }]}>Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
              <Text style={[styles.statusText, { color: statusStyle.text }]}>
                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
              </Text>
            </View>
          </View>
        </View>

        {/* Invoice Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.cardBackground }]}>
          {/* Header */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={[styles.invoiceId, { color: colors.text }]}>
                <Text style={{ color: colors.muted }}>#</Text>{invoice.id}
              </Text>
              <Text style={[styles.description, { color: colors.muted }]}>
                {invoice.description}
              </Text>
            </View>
          </View>

          {/* Sender Address */}
          <View style={styles.addressSection}>
            <Text style={[styles.address, { color: colors.muted }]}>
              {invoice.senderAddress.street}{'\n'}
              {invoice.senderAddress.city}{'\n'}
              {invoice.senderAddress.postCode}{'\n'}
              {invoice.senderAddress.country}
            </Text>
          </View>

          {/* Invoice Info Grid */}
          <View style={styles.infoGrid}>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Invoice Date</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(invoice.createdAt)}
              </Text>
            </View>
            <View style={styles.infoColumn}>
              <Text style={[styles.infoLabel, { color: colors.muted }]}>Payment Due</Text>
              <Text style={[styles.infoValue, { color: colors.text }]}>
                {formatDate(invoice.paymentDue)}
              </Text>
            </View>
          </View>

          {/* Bill To */}
          <View style={styles.billToSection}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Bill To</Text>
            <Text style={[styles.clientName, { color: colors.text }]}>
              {invoice.clientName}
            </Text>
            <Text style={[styles.address, { color: colors.muted }]}>
              {invoice.clientAddress.street}{'\n'}
              {invoice.clientAddress.city}{'\n'}
              {invoice.clientAddress.postCode}{'\n'}
              {invoice.clientAddress.country}
            </Text>
          </View>

          {/* Sent To */}
          <View style={styles.sentToSection}>
            <Text style={[styles.infoLabel, { color: colors.muted }]}>Sent to</Text>
            <Text style={[styles.email, { color: colors.text }]}>
              {invoice.clientEmail}
            </Text>
          </View>

          {/* Items */}
          <View style={[styles.itemsSection, { backgroundColor: colors.inputBackground }]}>
            {/* Items Header - Mobile */}
            <View style={styles.itemsContainer}>
              {invoice.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemLeft}>
                    <Text style={[styles.itemName, { color: colors.text }]}>
                      {item.name}
                    </Text>
                    <Text style={[styles.itemQuantity, { color: colors.muted }]}>
                      {item.quantity} x £ {item.price.toFixed(2)}
                    </Text>
                  </View>
                  <Text style={[styles.itemTotal, { color: colors.text }]}>
                    £ {item.total.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>

            {/* Total */}
            <View style={[styles.totalSection, { backgroundColor: colorScheme === 'dark' ? '#0C0E16' : '#373B53' }]}>
              <Text style={[styles.totalLabel, { color: '#FFFFFF' }]}>Amount Due</Text>
              <Text style={[styles.totalAmount, { color: '#FFFFFF' }]}>
                £ {invoice.total.toFixed(2)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.actionBar, { backgroundColor: colors.cardBackground }]}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]} 
          onPress={handleEdit}
        >
          <Text style={[styles.buttonText, { color: colors.muted }]}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]} 
          onPress={handleDelete}
        >
          <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Delete</Text>
        </TouchableOpacity>

        {invoice.status !== 'paid' && (
          <TouchableOpacity 
            style={[styles.actionButton, styles.primaryButton]} 
            onPress={handleMarkAsPaid}
          >
            <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Mark as Paid</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  detailsCard: {
    borderRadius: 8,
    padding: 24,
    marginBottom: 56,
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
  },
  description: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
  },
  addressSection: {
    marginBottom: 31,
  },
  address: {
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: -0.23,
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
  },
  infoValue: {
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: -0.31,
    fontWeight: '700',
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
  },
  itemsSection: {
    borderRadius: 8,
    overflow: 'hidden',
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
  },
  itemQuantity: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
  },
  itemTotal: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  totalLabel: {
    fontSize: 11,
    lineHeight: 18,
    letterSpacing: -0.23,
  },
  totalAmount: {
    fontSize: 20,
    lineHeight: 32,
    letterSpacing: -0.42,
    fontWeight: '700',
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 21,
    gap: 8,
  },
  actionButton: {
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 15,
    minWidth: 73,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#F9FAFE',
  },
  deleteButton: {
    backgroundColor: '#EC5757',
  },
  primaryButton: {
    backgroundColor: '#7C5DFA',
  },
  buttonText: {
    fontSize: 12,
    lineHeight: 15,
    letterSpacing: -0.25,
    fontWeight: '700',
  },
});

