import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Invoice } from '@/types/Invoice';
import { getInvoiceStatusColor, formatInvoiceDate, formatCurrency } from '@/utils/invoiceUtils';

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    elevation: 6,
    backgroundColor: colors.cardBackground,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexCol: {
    flexDirection: 'column',
  },
  id: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  clientName: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
    color: colors.text,
  },
  details: {
    marginTop: 14,
    marginBottom: 10,
  },
  due: {
    opacity: 0.8,
    color: colors.text,
    fontSize: 13,
    fontWeight: '400',
  },
  total: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
  },
  statusWrap: {
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 41,
    width: 120,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusText: {
    fontWeight: '700',
    fontSize: 14,
    textTransform: 'capitalize',
  },
});

type Props = {
  invoice: Invoice;
  onPress?: () => void;
};

const InvoiceCard: React.FC<Props> = ({ invoice, onPress }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);
  const statusStyle = getInvoiceStatusColor(invoice.status, colors, colorScheme ?? 'light');

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={styles.card}
    >
      <View style={styles.rowBetween}>
        <ThemedText style={styles.id}>
          #{invoice.id}
        </ThemedText>
        <ThemedText style={styles.clientName}>
          {invoice.clientName}
        </ThemedText>
      </View>

      <View style={styles.rowBetween}>
        <View style={[styles.flexCol, styles.details]}>
          <ThemedText style={styles.due}>
            Due {formatInvoiceDate(invoice.paymentDue)}
          </ThemedText>
          <ThemedText type="title" style={styles.total}>
            {formatCurrency(invoice.total)}
          </ThemedText>
        </View>

        <View style={[styles.statusWrap, { backgroundColor: statusStyle.bg }]}> 
          <View style={[styles.statusDot, { backgroundColor: statusStyle.dot }]} />
          <ThemedText style={[styles.statusText, { color: statusStyle.text }]}>
            {invoice.status}
          </ThemedText>
        </View>
      </View>
      
    </TouchableOpacity>
  );
};

export default InvoiceCard;
