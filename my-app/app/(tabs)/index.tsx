import { StyleSheet, FlatList, View } from 'react-native';
import { useEffect, useState, useMemo } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Invoice } from '@/types/Invoice';
import { InvoiceFilter, FilterValue } from '@/types/FilterTypes';
import { useTheme } from '@/context/ThemeContext';
import { Colors } from '@/constants/Colors';
import InvoiceCard from '@/components/InvoiceCard';
import ToolbarComponent from '@/components/Toolbar';
import LoadingFooter from '@/components/LoadingFooter';
import { SvgUri } from 'react-native-svg';
import { Asset } from 'expo-asset';
import { router } from 'expo-router';
import { useInvoiceData, useInvoicePagination, useInvoiceFilters } from '@/hooks/useInvoices';

export default function HomeScreen() {
  const { invoices, allInvoicesLoaded, isLoading, isLoaded, initializeStore } = useInvoiceData();
  const { hasMoreInvoices, isLoadingMore, loadMoreInvoices, resetPagination } = useInvoicePagination();
  const [selectedFilter, setSelectedFilter] = useState<FilterValue[]>([InvoiceFilter.ALL]);
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const styles = useMemo(() => createStyles(colors), [colors]);
  
  const filteredInvoices = useInvoiceFilters(invoices, selectedFilter);

  useEffect(() => {
    initializeStore();
  }, [initializeStore]);

  const handleFilterChange = (filters: FilterValue[]) => {
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
  const handleOnRefresh = () => {
    resetPagination();
    initializeStore();
  }
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
      <ThemedView style={StyleSheet.flatten([styles.container, styles.noInvoiceContainer])}> 
        <View style={{ alignItems: 'center', width: '100%' }}>
          {/* Illustration from assets */}
          <View style={{ marginBottom: 32}}>
            <SvgUri
              uri={Asset.fromModule(require('@/assets/illustration-empty.svg')).uri}
              width={240}
              height={200}
            />
          </View>
          <ThemedText type="title" style={styles.noInvoiceTitle}>
            There is nothing here
          </ThemedText>
          <ThemedText style={styles.noInvoiceDescription}>
            Create an invoice by clicking the <ThemedText style={styles.noInvoiceHighlight}>New</ThemedText> button and get started
          </ThemedText>
        </View>
      </ThemedView>
    );

  }

  return (
    <ThemedView style={styles.container}> 
      <ThemedView style={styles.header}> 
        <ThemedView style={styles.invoiceCountContainer}>
          <ThemedText type="subtitle" style={{ color: colors.text }}>Invoices</ThemedText>
          <ThemedText style={styles.invoiceCount}>
            {filteredInvoices.length} of {allInvoicesLoaded.length} invoices
          </ThemedText>
        </ThemedView>
        <ToolbarComponent onFilterChange={handleFilterChange} />
      </ThemedView>

        <FlatList
          data={filteredInvoices}
          renderItem={renderInvoice}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshing={isLoading}
          onRefresh={handleOnRefresh}
          // Infinite scroll props
          onEndReached={handleLoadMore}
          ListEmptyComponent={renderNoInvoice}
          onEndReachedThreshold={0.1} // Trigger when 10% from bottom
          ListFooterComponent={
            <LoadingFooter 
              isLoading={isLoadingMore} 
              hasMore={hasMoreInvoices} 
            />
            
          }
        />
    </ThemedView>
  );
}

const createStyles = (colors: typeof Colors.light) => StyleSheet.create({
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
    marginTop: 2,
    color: colors.text, 
  },
  invoiceCountContainer: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  listContainer: {
    paddingBottom: 20,
    backgroundColor: '#00000000',
  },
  invoiceCard: {
    borderRadius: 8,
    padding: 20,
    marginBottom: 16,
    backgroundColor: colors.cardBackground,
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
    color: colors.text, 
  },
  clientName: {
    fontSize: 14,
    opacity: 0.7,
    color: colors.muted, 
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
    color: colors.muted,
  },
  total: {
    fontSize: 18,
    color: colors.text, 
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
  noInvoiceContainer: {
     justifyContent: 'center', 
     alignItems: 'center',
  },
  noInvoiceTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  noInvoiceDescription: {
    color: colors.muted,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 260,
  },
  noInvoiceHighlight: {
    color: colors.primary,
    fontWeight: '700',
  },
});