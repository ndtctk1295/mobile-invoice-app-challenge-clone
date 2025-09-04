
export enum InvoiceFilter {
  ALL = 'All',
  DRAFT = 'Draft',
  PENDING = 'Pending',
  PAID = 'Paid'
}

// Type alias for filter values
export type FilterValue = `${InvoiceFilter}`;

// Helper function to convert enum values to array
export const getFilterOptions = (): FilterValue[] => {
  return Object.values(InvoiceFilter) as FilterValue[];
};

// Helper function to get filter display name
export const getFilterDisplayName = (filter: FilterValue): string => {
  return filter;
};

// Helper function to check if filter is valid
export const isValidFilter = (filter: string): filter is FilterValue => {
  return Object.values(InvoiceFilter).includes(filter as InvoiceFilter);
};
