import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useInvoiceStore from '@/stores/useInvoiceStore';
import { Invoice } from '@/types/Invoice';

export const useInvoiceData = () => {
  return useInvoiceStore(
    useShallow((state) => ({
      invoices: state.invoices,
      allInvoicesLoaded: state.allInvoicesLoaded,
      isLoading: state.isLoading,
      isLoaded: state.isLoaded,
      initializeStore: state.initializeStore,
    }))
  );
};

export const useInvoicePagination = () => {
  return useInvoiceStore(
    useShallow((state) => ({
      hasMoreInvoices: state.hasMoreInvoices,
      isLoadingMore: state.isLoadingMore,
      loadMoreInvoices: state.loadMoreInvoices,
      resetPagination: state.resetPagination,
      currentPage: state.currentPage,
      pageSize: state.pageSize,
    }))
  );
};

export const useInvoiceActions = () => {
  return useInvoiceStore(
    useShallow((state) => ({
      createInvoice: state.createInvoice,
      updateInvoice: state.updateInvoice,
      deleteInvoice: state.deleteInvoice,
      markAsPaid: state.markAsPaid,
    }))
  );
};

export const useInvoiceFilters = (invoices: Invoice[], selectedFilters: string[]) => {
  return useMemo(() => {
    if (selectedFilters.includes('All')) {
      return invoices;
    }

    const filterSet = new Set(selectedFilters.map(f => f.toLowerCase()));
    return invoices.filter(invoice => filterSet.has(invoice.status));
  }, [invoices, selectedFilters]);
};
