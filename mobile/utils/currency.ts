import { safeGetItem, safeSetItem } from './storage';

const DEFAULT_EXCHANGE_RATE = 55;
const BCV_RATE_KEY = '@bolosya_bcv_rate';
const LEGACY_RATE_KEY = '@bolosya_exchange_rate';

interface BCVStorageEntry {
  usdRate: number;
  eurRate: number;
}

export async function getExchangeRate(): Promise<number> {
  try {
    const stored = await safeGetItem(BCV_RATE_KEY);
    if (stored) {
      const parsed: BCVStorageEntry = JSON.parse(stored);
      if (parsed.usdRate > 0) {
        return parsed.usdRate;
      }
    }
  } catch {
    // fall through
  }

  try {
    const legacy = await safeGetItem(LEGACY_RATE_KEY);
    if (legacy) {
      const rate = parseFloat(legacy);
      if (!isNaN(rate) && rate > 0) {
        return rate;
      }
    }
  } catch {
    // fall through
  }

  return DEFAULT_EXCHANGE_RATE;
}

export async function setExchangeRate(rate: number): Promise<void> {
  if (rate <= 0) {
    throw new Error('Exchange rate must be positive');
  }
  const entry: BCVStorageEntry = {
    usdRate: rate,
    eurRate: 0,
  };
  await safeSetItem(BCV_RATE_KEY, JSON.stringify(entry));
}

/**
 * Convert BS to USD using current exchange rate
 */
export async function convertBsToUsd(bsAmount: number): Promise<number> {
  const rate = await getExchangeRate();
  if (rate <= 0) return bsAmount;
  return bsAmount / rate;
}

/**
 * Convert USD to BS using current exchange rate
 */
export async function convertUsdToBs(usdAmount: number): Promise<number> {
  const rate = await getExchangeRate();
  if (rate <= 0) return 0;
  return usdAmount * rate;
}

/**
 * Synchronous version using a provided exchange rate
 * Useful when you already have the rate cached
 */
export function convertBsToUsdSync(bsAmount: number, exchangeRate: number): number {
  return bsAmount / exchangeRate;
}

/**
 * Synchronous version using a provided exchange rate
 */
export function convertUsdToBsSync(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate;
}

/**
 * Format BS amount with Venezuelan formatting
 */
export function formatBs(amount: number): string {
  return `Bs ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Format USD amount with Venezuelan formatting
 */
export function formatUsd(amount: number): string {
  return `$ ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Detect currency from text
 * Returns 'BS', 'USD', or null
 * Uses word-boundary regex to avoid false positives on noise text.
 */
export function detectCurrencyFromText(text: string): 'BS' | 'USD' | null {
  const upper = text.toUpperCase();

  if (/\b(BS\.?(?:F\.?)?|BSF|BF|BOL[IÍ]VAR(?:ES)?)\b/.test(upper)) return 'BS';
  if (/\b(USD|U\$S|D[OÓ]LAR(?:ES)?|DLS|REF)\b/.test(upper)) return 'USD';
  if (/\b(EUR|EURO)\b/.test(upper)) return 'USD';
  if (/\$/.test(text)) return 'USD';
  if (/^REF/i.test(text)) return 'USD';

  return null;
}

/**
 * Guess currency from price magnitude and format.
 * Used as fallback when no keyword is found.
 * In Venezuelan context:
 *   - Prices >= 300 or with thousand separators → BS
 *   - Small prices ≤ 50 → likely USD
 */
export function guessCurrencyFromPrice(price: number, rawText: string): 'BS' | 'USD' | null {
  const hasThousandSeparator = /\.(?=\d{3})/.test(rawText);
  if (hasThousandSeparator || price >= 300) return 'BS';
  if (price <= 100) return 'USD';
  return null;
}

/**
 * Extract price value from text
 * Handles Venezuelan formatting (comma as decimal separator)
 */
export function extractPriceFromText(text: string): number | null {
  // Match numbers with optional thousand separators and decimal part
  const priceRegex = /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/;
  const match = text.match(priceRegex);
  if (!match) return null;

  const priceStr = match[0];
  // Replace comma decimal separator with dot, remove thousand separators
  const normalized = priceStr
    .replace(',', '.')
    .replace(/\.(?=\d{3})/g, '')
    .replace(/,/g, '');

  const price = parseFloat(normalized);
  return isNaN(price) ? null : price;
}
