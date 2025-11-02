/**
 * Safely converts a value to a number, handling both string and number inputs
 * @param value - The value to convert (can be string or number)
 * @param defaultValue - The default value to return if conversion fails
 * @returns The converted number
 */
export const toNumber = (value: string | number | undefined | null, defaultValue: number = 0): number => {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

/**
 * Formats a numeric value as currency with 2 decimal places
 * @param value - The value to format (can be string or number)
 * @param defaultValue - The default value to use if conversion fails
 * @returns Formatted string with 2 decimal places
 */
export const formatCurrency = (value: string | number | undefined | null, defaultValue: number = 0): string => {
  return toNumber(value, defaultValue).toFixed(2);
};
