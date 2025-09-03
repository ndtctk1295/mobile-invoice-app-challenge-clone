import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import { Invoice } from '@/types/Invoice';
import { format } from 'date-fns';
  // Format date to '19 Aug 2021'
  const formatDueDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'd MMM yyyy');
    } catch {
      return dateString;
    }
  };

type Props = {
  invoice: Invoice;
  onPress?: () => void;
};

const InvoiceCard: React.FC<Props> = ({ invoice, onPress }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getStatusProps = () => {
    switch (invoice.status) {
      case 'paid':
        return { bg: colors.inputBackground, color: colors.success, dot: colors.success };
      case 'pending':
        return { bg: colors.inputBackground, color: colors.warning, dot: colors.warning };
      case 'draft':
      default:
        return { bg: colors.inputBackground, color: colors.muted, dot: colors.muted };
    }
  };
  const statusProps = getStatusProps();

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.cardBackground }]}
    >
      <View style={styles.rowBetween}>
        <ThemedText
          // type="defaultSemiBold"
          style={[styles.id, { color: colors.text, fontSize: 14, fontWeight: '800' }]}
        >
          #{invoice.id}
        </ThemedText>
        <ThemedText style={[styles.clientName, { fontSize: 14, fontWeight: '500' }]}>{invoice.clientName}</ThemedText>
      </View>

      <View style={styles.rowBetween}>
        <View style={[styles.flexCol, styles.details]}>
          <ThemedText style={[styles.due, { color: colors.text, fontSize: 13, fontWeight: '400' }]}>Due {formatDueDate(invoice.paymentDue)}</ThemedText>
          <ThemedText type="title" style={[styles.total, { fontSize: 20, fontWeight: '800' }]}>£{invoice.total.toFixed(2)}</ThemedText>
        </View>

        <View style={[styles.statusWrap, { backgroundColor: statusProps.bg }]}> 
          <View style={[styles.statusDot, { backgroundColor: statusProps.dot }]} />
          <ThemedText style={[styles.statusText, { color: statusProps.color, fontSize: 14 }]}>{invoice.status}</ThemedText>
        </View>
      </View>
      
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 24,
    marginBottom: 16,
    elevation: 6,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flexCol:{
    flexDirection: 'column',
  },
  id: {
    // token: heading-xs
  },
  clientName: {
    // token: body-md
    opacity: 0.9,
  },
  details: {
    marginTop: 14,
    marginBottom: 10,
  },
  due: {
    opacity: 0.8,
  },
  total: {
    // token: display-sm
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
    color: '#fff',
    textTransform: 'capitalize',
  },
});

export default InvoiceCard;
