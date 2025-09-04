import { StyleSheet, FlatList, View, Button } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Invoice } from '@/types/Invoice';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import InvoiceCard from '@/components/InvoiceCard';
import ToolbarComponent from '@/components/Toolbar';
import LoadingFooter from '@/components/LoadingFooter';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import useInvoiceStore from '@/stores/useInvoiceStore';
export default function HomeScreen() {
  // Store selectors
  const invoices = useInvoiceStore((s) => s.invoices);
  const isLoading = useInvoiceStore((s) => s.isLoading);
  const isLoaded = useInvoiceStore((s) => s.isLoaded);
  const initializeStore = useInvoiceStore((s) => s.initializeStore);

  // Pagination selectors
  const hasMoreInvoices = useInvoiceStore((s) => s.hasMoreInvoices);
  const isLoadingMore = useInvoiceStore((s) => s.isLoadingMore);
  const loadMoreInvoices = useInvoiceStore((s) => s.loadMoreInvoices);
  const resetPagination = useInvoiceStore((s) => s.resetPagination);
  const allInvoicesLoaded = useInvoiceStore((s) => s.allInvoicesLoaded);
  
  const [selectedFilter, setSelectedFilter] = useState<string[]>(['All']);
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Initialize the store (seed from data.json on first run)
  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  // Filter invoices based on selected filter
  const filteredInvoices = useMemo(() => {
    if (selectedFilter.includes('All')) {
      return invoices;
    }
    return invoices.filter(invoice => 
      selectedFilter.some(filter => filter.toLowerCase() === invoice.status)
    );
  }, [invoices, selectedFilter]);

  const handleFilterChange = (filters: string[]) => {
    setSelectedFilter(filters);
    // Reset pagination when filter changes
    resetPagination();
  };

  const handleLoadMore = () => {
    // Only load more if we have more data to load
    if (hasMoreInvoices && !isLoadingMore) {
      loadMoreInvoices();
    }
  };
  const renderInvoice = ({ item }: { item: Invoice }) => (
    <InvoiceCard invoice={item} onPress={() => router.push(`/invoice/${item.id}`)} />
  );

  if (!isLoaded && isLoading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  function renderNoInvoice(){
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}> 
        <View style={{ alignItems: 'center', width: '100%' }}>
          {/* Illustration from assets */}
          <View style={{ marginBottom: 32}}>
            <SvgUri
              uri={Asset.fromModule(require('@/assets/illustration-empty.svg')).uri}
              width={240}
              height={200}
            />
          </View>
          <ThemedText type="title" style={{ color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center' }}>
            There is nothing here
          </ThemedText>
          <ThemedText style={{ color: colors.muted, fontSize: 16, textAlign: 'center', maxWidth: 260 }}>
            Create an invoice by clicking the <ThemedText style={{ color: colors.primary, fontWeight: '700' }}>New</ThemedText> button and get started
          </ThemedText>
        </View>
      </ThemedView>
    );

  }

  return (
    <ThemedView style={[styles.container]}> 
      <ThemedView style={[styles.header, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}> 
        <ThemedView style={{ flex: 1, flexDirection: 'column', alignItems: 'flex-start' }}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>Invoices</ThemedText>
          <ThemedText style={[styles.invoiceCount, { color: colors.text, marginTop: 2 }]}>
            {filteredInvoices.length} of {allInvoicesLoaded.length} invoices
          </ThemedText>
        </ThemedView>
        <ToolbarComponent onFilterChange={handleFilterChange} />
      </ThemedView>
      {filteredInvoices.length > 0 ? (
        <FlatList
          style={{ backgroundColor: '#00000000' }}
          data={filteredInvoices}
          renderItem={renderInvoice}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={() => {
            resetPagination();
            initializeStore();
          }}
          // Infinite scroll props
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.1} // Trigger when 10% from bottom
          ListFooterComponent={
            <LoadingFooter 
              isLoading={isLoadingMore} 
              hasMore={hasMoreInvoices} 
            />
          }
        />
      ) : renderNoInvoice()}
    </ThemedView>
  );


}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  invoiceCount: {
    fontSize: 14,
    opacity: 0.7,
  },
  listContainer: {
    paddingBottom: 20,
    backgroundColor: '#00000000',
  },
  invoiceCard: {
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  invoiceId: {
    fontSize: 16,
  },
  clientName: {
    fontSize: 14,
    opacity: 0.7,
  },
  invoiceDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dueDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  total: {
    fontSize: 18,
  },
  statusContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
});
