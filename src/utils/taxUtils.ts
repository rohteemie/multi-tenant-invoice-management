/**
 * Calculate tax amount for an item
 */
export const calculateItemTax = (
  quantity: number,
  unitPrice: number,
  taxRate: number = 0
): number => {
  const subtotal = quantity * unitPrice;
  return (subtotal * taxRate) / 100;
};

/**
 * Calculate item total including tax
 */
export const calculateItemTotal = (
  quantity: number,
  unitPrice: number,
  taxRate: number = 0
): number => {
  const subtotal = quantity * unitPrice;
  const tax = (subtotal * taxRate) / 100;
  return subtotal + tax;
};

/**
 * Calculate invoice totals with tax
 */
export const calculateInvoiceTotals = (
  items: Array<{
    quantity: number;
    unit_price: number;
    tax_rate?: number;
  }>
): {
  subtotal: number;
  totalTax: number;
  total: number;
  itemsWithTax: Array<{
    subtotal: number;
    tax: number;
    total: number;
  }>;
} => {
  let subtotal = 0;
  let totalTax = 0;
  const itemsWithTax = items.map((item) => {
    const itemSubtotal = item.quantity * item.unit_price;
    const itemTax = calculateItemTax(item.quantity, item.unit_price, item.tax_rate);
    const itemTotal = itemSubtotal + itemTax;
    
    subtotal += itemSubtotal;
    totalTax += itemTax;
    
    return {
      subtotal: itemSubtotal,
      tax: itemTax,
      total: itemTotal,
    };
  });
  
  return {
    subtotal,
    totalTax,
    total: subtotal + totalTax,
    itemsWithTax,
  };
};

/**
 * Format tax rate as percentage
 */
export const formatTaxRate = (rate: number): string => {
  return `${rate.toFixed(2)}%`;
};

/**
 * Validate tax rate
 */
export const isValidTaxRate = (rate: number): boolean => {
  return rate >= 0 && rate <= 100;
};
