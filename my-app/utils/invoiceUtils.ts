import { Colors } from '@/constants/Colors';
import { Invoice } from '@/types/Invoice';

/**
 * Global utility function to get status colors for invoice status badges
 * Can be reused across multiple components that display invoice status
 * 
 * @param status - The invoice status ('paid', 'pending', 'draft')
 * @param colors - The current theme color palette
 * @param colorScheme - The current color scheme ('light' | 'dark')
 * @returns Object containing background, text, and dot colors for the status
 */
export const getInvoiceStatusColor = (
  status: Invoice['status'],
  colors: typeof Colors.light,
  colorScheme: 'light' | 'dark'
) => {
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

/**
 * Formats a date string into a readable format (DD MMM YYYY)
 * 
 * @param dateString - ISO date string to format
 * @returns Formatted date string in 'DD MMM YYYY' format
 */
export const formatInvoiceDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

/**
 * Calculates the total amount for an invoice item
 * 
 * @param quantity - Item quantity
 * @param price - Item price
 * @returns Total amount (quantity * price)
 */
export const calculateItemTotal = (quantity: number, price: number): number => {
  return quantity * price;
};

/**
 * Formats currency amount for display
 * 
 * @param amount - The amount to format
 * @param currency - Currency symbol (default: '£')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = '£'): string => {
  return `${currency} ${amount.toFixed(2)}`;
};

/**
 * Generates a unique invoice ID in the format of 2 letters + 4 numbers (e.g., AB1234)
 * Ensures uniqueness by checking against existing invoice IDs
 * 
 * @param existingIds - Array of existing invoice IDs to check against for uniqueness
 * @returns A unique invoice ID string
 */
export const generateInvoiceId = (existingIds: string[] = []): string => { // existing ID tự lấy tự check
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  
  const generateId = (): string => {
    let id = '';
    // Add 2 random letters
    for (let i = 0; i < 2; i++) {
      id += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    // Add 4 random numbers
    for (let i = 0; i < 4; i++) {
      id += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    return id;
  };

  // Generate unique ID
  let id = generateId();
  while (existingIds.includes(id)) {
    id = generateId();
  }
  
  return id;
};

/**
 * Calculates the payment due date based on creation date and payment terms
 * 
 * @param createdAt - ISO date string of when the invoice was created
 * @param paymentTerms - Number of days until payment is due
 * @returns ISO date string (YYYY-MM-DD) for the payment due date
 */
export const calculatePaymentDue = (createdAt: string, paymentTerms: number): string => {
  const createdDate = new Date(createdAt);
  const dueDate = new Date(createdDate);
  dueDate.setDate(createdDate.getDate() + paymentTerms);
  return dueDate.toISOString().split('T')[0];
};

/**
 * Calculates the total amount for all items in an invoice
 * 
 * @param items - Array of invoice items with quantity and price
 * @returns Total amount for all items
 */
export const calculateInvoiceTotal = (items: Array<{quantity: number, price: number}>): number => {
  return items.reduce((total, item) => total + (item.quantity * item.price), 0);
};
