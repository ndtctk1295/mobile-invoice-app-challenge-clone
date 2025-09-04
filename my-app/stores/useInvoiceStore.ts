import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Invoice } from '@/types/Invoice';
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

  // Actions
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
  
  // Utility actions
  generateInvoiceId: () => string;
  calculatePaymentDue: (createdAt: string, paymentTerms: number) => string;
  calculateTotal: (items: Invoice['items']) => number;
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

      // Initialize store - seed from data.json if no persisted data exists
      initializeStore: async () => {
        const state = get();
        // Only initialize once
        if (state.isLoaded) return;

        set({ isLoading: true, error: null });

        try {
          // Check if we have persisted data
          const hasPersistedData = state.invoices.length > 0;
          
          if (!hasPersistedData) {
            // First time - seed from data.json
            console.log('Seeding initial data from data.json');
            const allInvoices = data as Invoice[];
            set({ 
              allInvoicesLoaded: allInvoices,
              invoices: allInvoices.slice(0, state.pageSize), // Load first page
              hasMoreInvoices: allInvoices.length > state.pageSize,
              currentPage: 1
            });
          } else {
            // We have persisted data, set up pagination
            set({ 
              allInvoicesLoaded: state.invoices,
              invoices: state.invoices.slice(0, state.pageSize),
              hasMoreInvoices: state.invoices.length > state.pageSize,
              currentPage: 1
            });
          }

          set({ isLoaded: true, isLoading: false });
        } catch (error) {
          console.error('Failed to initialize invoice store:', error);
          const fallbackInvoices = data as Invoice[];
          set({ 
            error: 'Failed to load invoice data',
            isLoading: false,
            invoices: fallbackInvoices.slice(0, state.pageSize), // Load first page
            allInvoicesLoaded: fallbackInvoices,
            hasMoreInvoices: fallbackInvoices.length > state.pageSize,
            isLoaded: true 
          });
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

      // Generate random invoice ID (2 letters + 4 numbers)
      generateInvoiceId: () => {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numbers = '0123456789';
        
        let id = '';
        // Add 2 random letters
        for (let i = 0; i < 2; i++) {
          id += letters.charAt(Math.floor(Math.random() * letters.length));
        }
        // Add 4 random numbers
        for (let i = 0; i < 4; i++) {
          id += numbers.charAt(Math.floor(Math.random() * numbers.length));
        }
        
        // Ensure uniqueness
        const invoices = get().invoices;
        while (invoices.some(invoice => invoice.id === id)) {
          id = get().generateInvoiceId();
        }
        
        return id;
      },

      // Calculate payment due date
      calculatePaymentDue: (createdAt: string, paymentTerms: number) => {
        const createdDate = new Date(createdAt);
        const dueDate = new Date(createdDate);
        dueDate.setDate(createdDate.getDate() + paymentTerms);
        return dueDate.toISOString().split('T')[0];
      },

      // Calculate total from items
      calculateTotal: (items: Invoice['items']) => {
        return items.reduce((total, item) => total + (item.quantity * item.price), 0);
      },

      // Create new invoice
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
        const id = invoiceData.id || state.generateInvoiceId();

        // Calculate payment due date
        const paymentDue = invoiceData.createdAt && invoiceData.paymentTerms
          ? state.calculatePaymentDue(invoiceData.createdAt, invoiceData.paymentTerms)
          : '';

        // Calculate total
        const total = invoiceData.items ? state.calculateTotal(invoiceData.items) : 0;

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

        // Add to store
        set(state => ({
          invoices: [...state.invoices, newInvoice],
          allInvoicesLoaded: [...state.allInvoicesLoaded, newInvoice],
          error: null
        }));

        return newInvoice;
      },

      // Update existing invoice
      updateInvoice: async (id: string, updates: Partial<Invoice>) => {
        const state = get();
        const invoiceIndex = state.invoices.findIndex(invoice => invoice.id === id);
        
        if (invoiceIndex === -1) {
          throw new Error('Invoice not found');
        }

        // Recalculate payment due if relevant fields changed
        if (updates.createdAt || updates.paymentTerms) {
          const invoice = state.invoices[invoiceIndex];
          const createdAt = updates.createdAt || invoice.createdAt;
          const paymentTerms = updates.paymentTerms || invoice.paymentTerms;
          updates.paymentDue = state.calculatePaymentDue(createdAt, paymentTerms);
        }

        // Recalculate total if items changed
        if (updates.items) {
          updates.total = state.calculateTotal(updates.items);
        }

        const updatedInvoice = { ...state.invoices[invoiceIndex], ...updates };

        // Update in store
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

      // Delete invoice
      deleteInvoice: async (id: string) => {
        const state = get();
        const invoiceExists = state.invoices.some(invoice => invoice.id === id);
        
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

        set({ isLoadingMore: true });

        try {
          // Simulate network delay
          await new Promise(resolve => setTimeout(resolve, 1000));

          const nextPage = state.currentPage + 1;
          const newInvoices = state.getInvoicesPage(nextPage, state.pageSize, state.allInvoicesLoaded);
          
          // Check if we have more data
          const totalInvoices = state.allInvoicesLoaded.length;
          const loadedSoFar = nextPage * state.pageSize;
          const hasMore = loadedSoFar < totalInvoices;

          set({
            invoices: [...state.invoices, ...newInvoices],
            currentPage: nextPage,
            hasMoreInvoices: hasMore,
            isLoadingMore: false,
          });

        } catch (error) {
          console.error('Failed to load more invoices:', error);
          set({ 
            isLoadingMore: false,
            error: 'Failed to load more invoices'
          });
        }
      },

      // Reset pagination (useful for filters)
      resetPagination: () => {
        const state = get();
        const firstPageInvoices = state.getInvoicesPage(1, state.pageSize, state.allInvoicesLoaded);
        const hasMore = state.allInvoicesLoaded.length > state.pageSize;
        set({
          invoices: firstPageInvoices,
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
