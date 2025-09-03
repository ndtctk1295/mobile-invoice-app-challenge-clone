import { useState, useEffect } from 'react';
import { Invoice } from '@/types/Invoice';

const invoicesData = require('../data.json');

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load data synchronously since it's local
    setInvoices(invoicesData);
    setLoading(false);
  }, []);

  return { invoices, loading };
};
