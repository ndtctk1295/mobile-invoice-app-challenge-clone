import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invoice } from '@/types/Invoice';
import { generateInvoiceId, calculatePaymentDue, calculateInvoiceTotal } from '@/utils/invoiceUtils';
import data from '@/data.json';

export type InvoiceStatus = 'draft' | 'pending' | 'paid';

interface InvoiceState {
  // State
  invoices: Invoice[];
  isLoaded: boolean;
  isLoading: boolean;
  error: string | null;

  // Pagination state
  currentPage: number;
  pageSize: number;
  hasMoreInvoices: boolean;
  isLoadingMore: boolean;
  allInvoicesLoaded: Invoice[]; // All invoices for filtering

  // Core mutation functions
  setInvoices: (invoices: Invoice[]) => void;
  addInvoice: (invoice: Invoice) => void;
  updateInvoiceById: (id: string, updates: Partial<Invoice>) => Invoice | null;
  removeInvoiceById: (id: string) => boolean;
  setLoadingState: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPaginationState: (updates: Partial<{
    currentPage: number;
    hasMoreInvoices: boolean;
    isLoadingMore: boolean;
  }>) => void;

  // Business logic actions
  initializeStore: () => Promise<void>;
  getAllInvoices: () => Invoice[];
  getInvoiceById: (id: string) => Invoice | undefined;
  getById: (id: string) => Invoice | undefined;
  createInvoice: (invoiceData: Partial<Invoice>, status: InvoiceStatus, validateRequired?: boolean) => Promise<Invoice>;
  updateInvoice: (id: string, updates: Partial<Invoice>) => Promise<Invoice>;
  deleteInvoice: (id: string) => Promise<boolean>;
  markAsPaid: (id: string) => Promise<Invoice>;
  
  // Pagination actions
  loadMoreInvoices: () => Promise<void>;
  resetPagination: () => void;
  getInvoicesPage: (page: number, pageSize: number, allInvoices: Invoice[]) => Invoice[];
}

const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      // Initial State
      invoices: [],
      isLoaded: false,
      isLoading: false,
      error: null,

      // Pagination initial state
      currentPage: 1,
      pageSize: 10,
      hasMoreInvoices: true,
      isLoadingMore: false,
      allInvoicesLoaded: [],

      // Core mutation functions - these handle the basic data operations
      setInvoices: (invoices: Invoice[]) => {
        set({ 
          allInvoicesLoaded: invoices,
          invoices: invoices.slice(0, get().pageSize),
          hasMoreInvoices: invoices.length > get().pageSize,
          currentPage: 1
        });
      },

      addInvoice: (invoice: Invoice) => {
        set(state => ({
          invoices: [...state.invoices, invoice],
          allInvoicesLoaded: [...state.allInvoicesLoaded, invoice],
          error: null
        }));
      },

      updateInvoiceById: (id: string, updates: Partial<Invoice>) => {
        const state = get();
        const currentInvoice = state.allInvoicesLoaded.find(invoice => invoice.id === id) ||
                              state.invoices.find(invoice => invoice.id === id);
        
        if (!currentInvoice) {
          return null;
        }

        const updatedInvoice = { ...currentInvoice, ...updates };

        set(state => ({
          invoices: state.invoices.map(invoice => 
            invoice.id === id ? updatedInvoice : invoice
          ),
          allInvoicesLoaded: state.allInvoicesLoaded.map(invoice => 
            invoice.id === id ? updatedInvoice : invoice
          ),
          error: null
        }));

        return updatedInvoice;
      },

      removeInvoiceById: (id: string) => {
        const state = get();
        const invoiceExists = state.allInvoicesLoaded.some(invoice => invoice.id === id) ||
                             state.invoices.some(invoice => invoice.id === id);
        
        if (!invoiceExists) {
          return false;
        }

        set(state => ({
          invoices: state.invoices.filter(invoice => invoice.id !== id),
          allInvoicesLoaded: state.allInvoicesLoaded.filter(invoice => invoice.id !== id),
          error: null
        }));

        return true;
      },

      setLoadingState: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setError: (error: string | null) => {
        set({ error });
      },

      setPaginationState: (updates) => {
        set(state => ({ ...state, ...updates }));
      },

      // Initialize store - seed from data.json if no persisted data exists
      initializeStore: async () => {
        const state = get();
        // Only initialize once
        if (state.isLoaded) return;

        state.setLoadingState(true);
        state.setError(null);

        try {
          // Check if we have persisted data
          const hasPersistedData = state.invoices.length > 0;
          
          if (!hasPersistedData) {
            // First time - seed from data.json
            console.log('Seeding initial data from data.json');
            const allInvoices = data as Invoice[];
            state.setInvoices(allInvoices);
          } else {
            // We have persisted data, set up pagination
            state.setInvoices(state.invoices);
          }

          set({ isLoaded: true, isLoading: false });
        } catch (error) {
          console.error('Failed to initialize invoice store:', error);
          const fallbackInvoices = data as Invoice[];
          state.setError('Failed to load invoice data');
          state.setLoadingState(false);
          state.setInvoices(fallbackInvoices);
          set({ isLoaded: true });
        }
      },

      // Get all invoices
      getAllInvoices: () => {
        return get().invoices;
      },

      // Get invoice by ID
      getInvoiceById: (id: string) => {
        return get().allInvoicesLoaded.find(invoice => invoice.id === id) || 
               get().invoices.find(invoice => invoice.id === id);
      },

      // Convenience alias
      getById: (id: string) => {
        return get().getInvoiceById(id);
      },

      //  Create new invoice
      createInvoice: async (invoiceData: Partial<Invoice>, status: InvoiceStatus, validateRequired = false) => {
        const state = get();

        // Validation for "Save & Send" (pending status)
        if (validateRequired && status === 'pending') {
          const requiredFields = [
            'clientName', 'clientEmail', 'clientAddress', 
            'description', 'createdAt', 'paymentTerms'
          ];
          for (const field of requiredFields) {
            if (!invoiceData[field as keyof Invoice]) {
              throw new Error(`${field} is required for pending invoices`);
            }
          }

          if (!invoiceData.items || invoiceData.items.length === 0) {
            throw new Error('At least one item is required for pending invoices');
          }
        }

        // Generate ID if not provided
        const existingInvoices = state.allInvoicesLoaded.length > 0 ? state.allInvoicesLoaded : state.invoices;
        const existingIds = existingInvoices.map(invoice => invoice.id);
        const id = invoiceData.id || generateInvoiceId(existingIds);

        // Calculate payment due date
        const paymentDue = invoiceData.createdAt && invoiceData.paymentTerms
          ? calculatePaymentDue(invoiceData.createdAt, invoiceData.paymentTerms)
          : '';

        // Calculate total
        const total = invoiceData.items ? calculateInvoiceTotal(invoiceData.items) : 0;

        const newInvoice: Invoice = {
          id,
          createdAt: invoiceData.createdAt || new Date().toISOString().split('T')[0],
          paymentDue,
          description: invoiceData.description || '',
          paymentTerms: invoiceData.paymentTerms || 30,
          clientName: invoiceData.clientName || '',
          clientEmail: invoiceData.clientEmail || '',
          status,
          senderAddress: invoiceData.senderAddress || {
            street: '',
            city: '',
            postCode: '',
            country: ''
          },
          clientAddress: invoiceData.clientAddress || {
            street: '',
            city: '',
            postCode: '',
            country: ''
          },
          items: invoiceData.items || [],
          total
        };

        // Use core mutation function
        state.addInvoice(newInvoice);
        return newInvoice;
      },

      // Update existing invoice
      updateInvoice: async (id: string, updates: Partial<Invoice>) => {
        const state = get();
        
        // Find the invoice first
        const existingInvoice = state.getInvoiceById(id);
        if (!existingInvoice) {
          throw new Error('Invoice not found');
        }

        // Recalculate payment due if relevant fields changed
        if (updates.createdAt || updates.paymentTerms) {
          const createdAt = updates.createdAt || existingInvoice.createdAt;
          const paymentTerms = updates.paymentTerms || existingInvoice.paymentTerms;
          updates.paymentDue = calculatePaymentDue(createdAt, paymentTerms);
        }

        // Recalculate total if items changed
        if (updates.items) {
          updates.total = calculateInvoiceTotal(updates.items);
        }

        // Use core mutation function
        const updatedInvoice = state.updateInvoiceById(id, updates);
        
        if (!updatedInvoice) {
          throw new Error('Failed to update invoice');
        }

        return updatedInvoice;
      },

      // Delete invoice
      deleteInvoice: async (id: string) => {
        const state = get();
        // Use core mutation function
        return state.removeInvoiceById(id);
      },

      // Mark invoice as paid
      markAsPaid: async (id: string) => {
        return get().updateInvoice(id, { status: 'paid' });
      },

      // Get paginated invoices (simulate server pagination)
      getInvoicesPage: (page: number, pageSize: number, allInvoices: Invoice[]) => {
        const startIndex = (page - 1) * pageSize;
        const endIndex = startIndex + pageSize;
        return allInvoices.slice(startIndex, endIndex);
      },

      // Load more invoices for infinite scroll
      loadMoreInvoices: async () => {
        const state = get();
        
        // Prevent multiple simultaneous loads
        if (state.isLoadingMore || !state.hasMoreInvoices) return;

        state.setPaginationState({ isLoadingMore: true });

        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          const nextPage = state.currentPage + 1;
          const newInvoices = state.getInvoicesPage(nextPage, state.pageSize, state.allInvoicesLoaded);
          
          // Check if we have more data
          const totalInvoices = state.allInvoicesLoaded.length;
          const loadedSoFar = nextPage * state.pageSize;
          const hasMore = loadedSoFar < totalInvoices;

          // Update invoices and pagination state using core mutations
          set(state => ({
            invoices: [...state.invoices, ...newInvoices],
          }));

          state.setPaginationState({
            currentPage: nextPage,
            hasMoreInvoices: hasMore,
            isLoadingMore: false,
          });

        } catch (error) {
          console.error('Failed to load more invoices:', error);
          state.setPaginationState({ isLoadingMore: false });
          state.setError('Failed to load more invoices');
        }
      },

      // Reset pagination (useful for filters)
      resetPagination: () => {
        const state = get();
        const firstPageInvoices = state.getInvoicesPage(1, state.pageSize, state.allInvoicesLoaded);
        const hasMore = state.allInvoicesLoaded.length > state.pageSize;
        
        set({
          invoices: firstPageInvoices,
        });

        state.setPaginationState({
          currentPage: 1,
          hasMoreInvoices: hasMore,
          isLoadingMore: false,
        });
      }
    }),
    {
      name: 'invoice-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist the invoices array, not loading states or pagination
      partialize: (state) => ({ 
        invoices: state.allInvoicesLoaded.length > 0 ? state.allInvoicesLoaded : state.invoices 
      }),
    }
  )
);

export default useInvoiceStore;
