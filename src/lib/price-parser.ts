/**
 * Robust Price & Number Parser for Sokher Store
 * Prevents "Price Save Bug":
 * - Converts Bengali numerals (০-৯) to Arabic digits (0-9)
 * - Strips commas ("1,200" -> 1200), currency signs (৳, Tk, BDT), extra spaces
 * - Enforces positive, non-zero validation
 * - Handles optional regularPrice preserving existing values
 */

const banglaToEnglishMap: { [key: string]: string } = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

export function parsePrice(input: any, fieldName = 'Price'): { value: number; error: string | null } {
  if (input === null || input === undefined || input === '') {
    return { value: 0, error: `${fieldName} ফাঁকা রাখা যাবে না (cannot be empty).` };
  }

  let cleaned = String(input).trim();

  // Convert Bengali digits to English
  cleaned = cleaned.replace(/[০-৯]/g, (digit) => banglaToEnglishMap[digit] || digit);

  // Remove commas, currency symbols (৳, Tk, BDT), and spaces
  cleaned = cleaned.replace(/[\s,৳]/g, '').replace(/bdt|tk/gi, '');

  const num = parseFloat(cleaned);

  if (isNaN(num)) {
    return { value: 0, error: `সঠিক সংখ্যা লিখুন (${fieldName} must be a valid number).` };
  }

  if (num <= 0) {
    return { value: 0, error: `${fieldName} শূন্য (0) বা নেগেটিভ হতে পারবে না (${fieldName} must be greater than 0).` };
  }

  return { value: Math.round(num * 100) / 100, error: null };
}

export function parseOptionalPrice(input: any): { value: number | null; error: string | null } {
  if (input === null || input === undefined || String(input).trim() === '') {
    return { value: null, error: null };
  }
  return parsePrice(input, 'Regular Price');
}

/**
 * Consistent Discount Percentage Calculation
 * Formula: ((regularPrice - price) / regularPrice) * 100
 */
export function calculateDiscountPercent(price: number, regularPrice?: number | null): number {
  if (!regularPrice || regularPrice <= price || regularPrice <= 0) {
    return 0;
  }
  return Math.round(((regularPrice - price) / regularPrice) * 100);
}

/**
 * Currency Formatter for Bangladesh (BDT ৳)
 */
export function formatPrice(amount: number): string {
  const formatted = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 0,
  }).format(amount);
  return `৳ ${formatted}`;
}
