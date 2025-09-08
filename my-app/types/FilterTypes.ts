export enum InvoiceFilter {
  ALL = 'All',
  DRAFT = 'Draft',
  PENDING = 'Pending', 
  PAID = 'Paid'
}

// Helper functions now use InvoiceFilter directly
export const getFilterOptions = (): InvoiceFilter[] => {
  return Object.values(InvoiceFilter);
};

export const getFilterDisplayName = (filter: InvoiceFilter): string => {
  return filter;
};

export const isValidFilter = (filter: string): filter is InvoiceFilter => {
  return Object.values(InvoiceFilter).includes(filter as InvoiceFilter);
};