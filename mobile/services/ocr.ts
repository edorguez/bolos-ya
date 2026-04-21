import { recognizeText } from '@infinitered/react-native-mlkit-text-recognition'
import * as FileSystem from 'expo-file-system'
import { getExchangeRate, detectCurrencyFromText, extractPriceFromText } from '../utils/currency'
import { convertBsToUsd, convertUsdToBs } from '../utils/formatters'

export interface ScanResult {
  rawText: string
  productName: string
  price: number
  currency: 'BS' | 'USD'
  priceBs: number
  priceUsd: number
  confidence: number
}

export interface ScanError {
  message: string
  rawText?: string
  error?: unknown
}

// Fixed exchange rate (1 USD = X BS)
// TODO: Make this configurable via user settings or sync from backend

/**
 * Extract product name from OCR text blocks
 * Attempts to find the line closest to the price that isn't a price line
 */
function extractProductName(blocks: any[], priceLineIndex: number): string {
  if (blocks.length === 0) return 'Producto desconocido'

  // Look for lines above the price line (product name is often above price)
  for (let i = Math.max(0, priceLineIndex - 1); i >= 0; i--) {
    const block = blocks[i]
    const text = block.text.trim()
    if (text && !detectCurrencyFromText(text) && !extractPriceFromText(text)) {
      return text
    }
  }

  // If not found above, look below
  for (let i = priceLineIndex + 1; i < blocks.length; i++) {
    const block = blocks[i]
    const text = block.text.trim()
    if (text && !detectCurrencyFromText(text) && !extractPriceFromText(text)) {
      return text
    }
  }

  // Fallback to first non-price line
  for (const block of blocks) {
    const text = block.text.trim()
    if (text && !detectCurrencyFromText(text) && !extractPriceFromText(text)) {
      return text
    }
  }

  // Last resort: return first line
  return blocks[0]?.text.trim() || 'Producto desconocido'
}

/**
 * Main OCR scanning function
 * Takes an image URI (from camera or gallery) and returns parsed product data
 */
export async function scanImage(imageUri: string): Promise<ScanResult> {
  try {
    // Verify image exists
    const fileInfo = await FileSystem.getInfoAsync(imageUri)
    if (!fileInfo.exists) {
      throw new Error('Image file not found')
    }

    // Perform OCR using ML Kit
    const { text, blocks } = await recognizeText(imageUri)

    if (!text || text.trim().length === 0) {
      throw new Error('No text detected in image')
    }

    // Split text into lines for analysis
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)

    let detectedPrice: number | null = null
    let detectedCurrency: 'BS' | 'USD' | null = null
    let priceLineIndex = -1

    // Find price and currency in lines
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]
      const price = extractPriceFromText(line)
      const currency = detectCurrencyFromText(line)

      if (price && currency) {
        detectedPrice = price
        detectedCurrency = currency
        priceLineIndex = i
        break
      }
    }

    // If price found without currency, try to infer from context
    if (detectedPrice && !detectedCurrency) {
      for (let i = 0; i < lines.length; i++) {
        const currency = detectCurrencyFromText(lines[i])
        if (currency) {
          detectedCurrency = currency
          break
        }
      }
    }

    // If still no currency, default to BS (Bolívares)
    if (!detectedCurrency) {
      detectedCurrency = 'BS'
    }

    // If no price detected, throw error
    if (!detectedPrice) {
      throw new Error('No price found in image')
    }

    // Calculate both currency values using current exchange rate
    const exchangeRate = await getExchangeRate()
    let priceBs: number
    let priceUsd: number

    if (detectedCurrency === 'BS') {
      priceBs = detectedPrice
      priceUsd = convertBsToUsd(detectedPrice, exchangeRate)
    } else {
      priceUsd = detectedPrice
      priceBs = convertUsdToBs(detectedPrice, exchangeRate)
    }

    // Extract product name
    const productName = extractProductName(blocks || [], priceLineIndex)

    return {
      rawText: text,
      productName,
      price: detectedPrice,
      currency: detectedCurrency,
      priceBs,
      priceUsd,
      confidence: 0.8, // TODO: Calculate actual confidence based on ML Kit results
    }
  } catch (error) {
    console.error('OCR scanning error:', error)
    throw new Error(
      `Failed to scan image: ${error instanceof Error ? error.message : 'Unknown error'}`
    )
  }
}

/**
 * Utility function to capture image from camera and scan it
 * This would be used in the scan component
 */
export async function captureAndScan(cameraRef: React.RefObject<any>): Promise<ScanResult> {
  try {
    if (!cameraRef.current) {
      throw new Error('Camera not ready')
    }

    // Take picture
    const photo = await cameraRef.current.takePictureAsync({
      quality: 0.8,
      base64: false,
      exif: false,
    })

    // Scan the captured image
    return await scanImage(photo.uri)
  } catch (error) {
    console.error('Capture and scan error:', error)
    throw error
  }
}

export default {
  scanImage,
  captureAndScan,
  detectCurrencyFromText,
  extractPriceFromText,
}
