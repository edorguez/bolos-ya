import { safeGetItem, safeSetItem } from './storage'

// Default exchange rate (1 USD = X BS)
// This is a reasonable default for Venezuela
const DEFAULT_EXCHANGE_RATE = 35

const EXCHANGE_RATE_KEY = '@bolosya_exchange_rate'

/**
 * Get the current exchange rate from storage, or return default
 */
export async function getExchangeRate(): Promise<number> {
  try {
    const stored = await safeGetItem(EXCHANGE_RATE_KEY)
    if (stored) {
      const rate = parseFloat(stored)
      if (!isNaN(rate) && rate > 0) {
        return rate
      }
    }
  } catch (error) {
    console.warn('Failed to load exchange rate from storage:', error)
  }

  return DEFAULT_EXCHANGE_RATE
}

/**
 * Save a new exchange rate to storage
 */
export async function setExchangeRate(rate: number): Promise<void> {
  if (rate <= 0) {
    throw new Error('Exchange rate must be positive')
  }

  await safeSetItem(EXCHANGE_RATE_KEY, rate.toString())
}

/**
 * Convert BS to USD using current exchange rate
 */
export async function convertBsToUsd(bsAmount: number): Promise<number> {
  const rate = await getExchangeRate()
  return bsAmount / rate
}

/**
 * Convert USD to BS using current exchange rate
 */
export async function convertUsdToBs(usdAmount: number): Promise<number> {
  const rate = await getExchangeRate()
  return usdAmount * rate
}

/**
 * Synchronous version using a provided exchange rate
 * Useful when you already have the rate cached
 */
export function convertBsToUsdSync(bsAmount: number, exchangeRate: number): number {
  return bsAmount / exchangeRate
}

/**
 * Synchronous version using a provided exchange rate
 */
export function convertUsdToBsSync(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate
}

/**
 * Format BS amount with Venezuelan formatting
 */
export function formatBs(amount: number): string {
  return `Bs ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Format USD amount with Venezuelan formatting
 */
export function formatUsd(amount: number): string {
  return `$ ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/**
 * Detect currency from text
 * Returns 'BS', 'USD', or null
 */
export function detectCurrencyFromText(text: string): 'BS' | 'USD' | null {
  const lower = text.toLowerCase()
  if (lower.includes('bs') || lower.includes('bolívar')) return 'BS'
  if (lower.includes('usd') || lower.includes('dólar') || lower.includes('$')) return 'USD'
  return null
}

/**
 * Extract price value from text
 * Handles Venezuelan formatting (comma as decimal separator)
 */
export function extractPriceFromText(text: string): number | null {
  // Match numbers with optional thousand separators and decimal part
  const priceRegex = /(\d{1,3}(?:[.,]\d{3})*[.,]\d{2})/
  const match = text.match(priceRegex)
  if (!match) return null

  const priceStr = match[0]
  // Replace comma decimal separator with dot, remove thousand separators
  const normalized = priceStr
    .replace(',', '.')
    .replace(/\.(?=\d{3})/g, '')
    .replace(/,/g, '')

  const price = parseFloat(normalized)
  return isNaN(price) ? null : price
}
