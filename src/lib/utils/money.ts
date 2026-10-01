/**
 * Presentation-only money and currency formatting utilities.
 *
 * NOTE: The backend financial ledger remains the authoritative source of truth.
 * These utilities are strictly for UI presentation and formatting.
 */

export interface FormatCurrencyOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showCurrencySymbol?: boolean;
}

/**
 * Formats a numeric or Decimal string amount as a localized currency string.
 * Example: formatCurrency('1250.50') -> '₹1,250.50'
 */
export function formatCurrency(
  amount: string | number | null | undefined,
  options: FormatCurrencyOptions = {}
): string {
  if (amount === null || amount === undefined || amount === '') {
    return '₹0.00';
  }

  const numValue = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(numValue)) {
    return '₹0.00';
  }

  const currency = options.currency || 'INR';
  const minDigits = options.minimumFractionDigits ?? (numValue % 1 === 0 ? 0 : 2);
  const maxDigits = options.maximumFractionDigits ?? 2;

  try {
    const formatter = new Intl.NumberFormat('en-IN', {
      style: options.showCurrencySymbol === false ? 'decimal' : 'currency',
      currency,
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
    });

    return formatter.format(numValue);
  } catch {
    // Fallback if Intl fails
    const formatted = numValue.toFixed(maxDigits);
    return options.showCurrencySymbol === false ? formatted : `₹${formatted}`;
  }
}

/**
 * Converts integer paise (1/100 INR) to Rupees currency string.
 * Example: formatPaise(25000) -> '₹250.00'
 */
export function formatPaise(paise: number): string {
  return formatCurrency(paise / 100);
}

/**
 * Formats points into rewards valuation string (100 points = ₹10.00).
 */
export function formatRewardPointsValuation(points: number): string {
  const rupees = (points / 100) * 10;
  return formatCurrency(rupees);
}
