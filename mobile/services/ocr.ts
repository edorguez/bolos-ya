import * as FileSystem from 'expo-file-system/legacy';
import {
  getExchangeRate,
  detectCurrencyFromText,
  extractPriceFromText,
  guessCurrencyFromPrice,
} from '../utils/currency';
import { convertBsToUsd, convertUsdToBs } from '../utils/formatters';

export interface ScanResult {
  rawText: string;
  productName: string;
  price: number;
  currency: 'BS' | 'USD';
  priceBs: number;
  priceUsd: number;
  confidence: number;
  warning?: string;
}

interface TextBlock {
  text: string;
  frame: { left: number; top: number; right: number; bottom: number };
  recognizedLanguages: string[];
  lines: { text: string; frame: any; recognizedLanguages: string[]; elements: any[] }[];
}

interface TextRecognitionResult {
  text: string;
  blocks: TextBlock[];
}

type RecognizeTextFn = (imageUri: string) => Promise<TextRecognitionResult>;

let recognizeTextImpl: RecognizeTextFn | null = null;

async function loadMLKit(): Promise<RecognizeTextFn | null> {
  if (recognizeTextImpl) return recognizeTextImpl;
  try {
    const { recognizeText } = await import('@infinitered/react-native-mlkit-text-recognition');
    recognizeTextImpl = recognizeText;
    return recognizeTextImpl;
  } catch {
    console.warn('[OCR] ML Kit not available');
    return null;
  }
}

async function mockScanImage(_imageUri: string): Promise<ScanResult> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const exchangeRate = await getExchangeRate();
  const priceBs = 25.5;
  const priceUsd = convertBsToUsd(priceBs, exchangeRate);

  return {
    rawText: 'Arroz Paddy\nBs 25,50',
    productName: 'Arroz Paddy',
    price: priceBs,
    currency: 'BS',
    priceBs,
    priceUsd,
    confidence: 0.95,
  };
}

export async function preprocessImage(uri: string): Promise<string> {
  return uri;
}

function isLikelyNoise(text: string): boolean {
  if (text.length < 3) return true;
  if (/\d{6,}/.test(text)) return true;
  if (/^(lote|fab|venc|fecha|serial|cod|ref)\s*:?\s*\d+$/i.test(text.replace(/\s/g, '')))
    return true;
  return false;
}

function extractProductNameFromBlocks(blocks: TextBlock[], priceBlockIndex: number): string {
  for (let i = priceBlockIndex - 1; i >= 0; i--) {
    const lines = blocks[i].text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      if (!isLikelyNoise(line) && !extractPriceFromText(line) && !detectCurrencyFromText(line)) {
        return line;
      }
    }
  }

  for (let i = priceBlockIndex + 1; i < blocks.length; i++) {
    const lines = blocks[i].text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    for (const line of lines) {
      if (!isLikelyNoise(line) && !extractPriceFromText(line) && !detectCurrencyFromText(line)) {
        return line;
      }
    }
  }

  const priceLines = blocks[priceBlockIndex].text
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);
  for (const line of priceLines) {
    if (!isLikelyNoise(line) && !extractPriceFromText(line) && !detectCurrencyFromText(line)) {
      return line;
    }
  }

  return '';
}

function extractLenientPrice(text: string): number | null {
  const cleaned = text.trim();
  if (/^\d{2,6}$/.test(cleaned)) {
    return parseInt(cleaned, 10);
  }
  return null;
}

export async function scanImage(imageUri: string): Promise<ScanResult> {
  const fileInfo = await FileSystem.getInfoAsync(imageUri);
  if (!fileInfo.exists) {
    return {
      rawText: '',
      productName: 'Producto desconocido',
      price: 0,
      currency: 'BS',
      priceBs: 0,
      priceUsd: 0,
      confidence: 0,
      warning: 'No se pudo encontrar la imagen. Intenta nuevamente.',
    };
  }

  const enhancedUri = await preprocessImage(imageUri);

  const recognizer = await loadMLKit();
  let text: string;
  let blocks: TextBlock[];

  if (recognizer) {
    console.log('Recognizer result: ');
    const result = await recognizer(enhancedUri);
    console.log(result);
    text = result.text;
    blocks = result.blocks;
  } else {
    return mockScanImage(imageUri);
  }

  if (!text || text.trim().length === 0) {
    return {
      rawText: '',
      productName: 'Producto desconocido',
      price: 0,
      currency: 'BS',
      priceBs: 0,
      priceUsd: 0,
      confidence: 0,
      warning: 'No se pudo leer la etiqueta. Acerca la cámara y asegura buena iluminación.',
    };
  }

  // ── Block-aware parsing ──────────────────────────────────────────
  const sortedBlocks = [...blocks].sort((a, b) => a.frame.top - b.frame.top);

  // Find product name block first (largest block of natural text)
  let productBlockIndex = -1;
  let productBlockScore = 0;
  for (let i = 0; i < sortedBlocks.length; i++) {
    const lines = sortedBlocks[i].text
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);
    let score = 0;
    for (const line of lines) {
      if (
        line.length >= 8 &&
        !isLikelyNoise(line) &&
        !extractPriceFromText(line) &&
        !detectCurrencyFromText(line)
      ) {
        score += line.length;
      }
    }
    if (score > productBlockScore) {
      productBlockScore = score;
      productBlockIndex = i;
    }
  }

  // Score blocks for price with proximity bonus to product block
  const PROXIMITY_RANGE = 2;
  let detectedPrice: number | null = null;
  let detectedCurrency: 'BS' | 'USD' | null = null;
  let priceSourceText = '';
  let bestBlockIndex = -1;

  for (let i = 0; i < sortedBlocks.length; i++) {
    const blockText = sortedBlocks[i].text.trim();
    const price = extractPriceFromText(blockText);
    const currency = detectCurrencyFromText(blockText);
    let score = 0;

    if (price !== null) score += 3;
    if (currency !== null) score += 2;
    if (/\d{6,}/.test(blockText)) score -= 2;
    if (blockText.length < 4) score -= 1;
    if (/^\d{2,6}$/.test(blockText)) score += 1;

    if (productBlockIndex >= 0) {
      const dist = Math.abs(i - productBlockIndex);
      if (dist <= PROXIMITY_RANGE) {
        score += PROXIMITY_RANGE - dist;
      }
    }

    if (price !== null && score > (detectedPrice !== null ? 0 : -99)) {
      detectedPrice = price;
      detectedCurrency = currency;
      priceSourceText = blockText;
      bestBlockIndex = i;
    }
  }

  // ── Lenient price fallback on blocks near product block ─────────
  if (detectedPrice === null) {
    for (let i = 0; i < sortedBlocks.length; i++) {
      const nakedPrice = extractLenientPrice(sortedBlocks[i].text);
      if (nakedPrice !== null) {
        const dist = productBlockIndex >= 0 ? Math.abs(i - productBlockIndex) : 0;
        if (productBlockIndex < 0 || dist <= PROXIMITY_RANGE + 1) {
          detectedPrice = nakedPrice;
          priceSourceText = sortedBlocks[i].text.trim();
          bestBlockIndex = i;
          break;
        }
      }
    }
  }

  // ── Fallback: flat text parsing ──────────────────────────────────
  if (detectedPrice === null) {
    const lines = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    for (const line of lines) {
      const price = extractPriceFromText(line);
      const currency = detectCurrencyFromText(line);
      if (price !== null) {
        detectedPrice = price;
        detectedCurrency = currency;
        priceSourceText = line;
        if (currency) break;
      }
    }

    if (detectedPrice !== null && !detectedCurrency) {
      for (const line of lines) {
        const currency = detectCurrencyFromText(line);
        if (currency) {
          detectedCurrency = currency;
          break;
        }
      }
    }

    // Lenient fallback in flat text too
    if (detectedPrice === null) {
      for (const line of lines) {
        const nakedPrice = extractLenientPrice(line);
        if (nakedPrice !== null) {
          detectedPrice = nakedPrice;
          priceSourceText = line;
          break;
        }
      }
    }
  }

  // ── Magnitude heuristic ──────────────────────────────────────────
  if (detectedPrice !== null && !detectedCurrency) {
    detectedCurrency = guessCurrencyFromPrice(detectedPrice, priceSourceText);
  }
  if (!detectedCurrency) detectedCurrency = 'BS';

  if (detectedPrice === null) {
    return {
      rawText: text,
      productName: 'Producto desconocido',
      price: 0,
      currency: detectedCurrency,
      priceBs: 0,
      priceUsd: 0,
      confidence: 0.3,
      warning: 'No se detectó un precio. Asegúrate de que el precio esté visible.',
    };
  }

  // ── Product name ──────────────────────────────────────────────────
  let productName = 'Producto desconocido';
  if (bestBlockIndex >= 0) {
    const found = extractProductNameFromBlocks(sortedBlocks, bestBlockIndex);
    if (found) productName = found;
  }
  if (productName === 'Producto desconocido') {
    const lines = text
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);
    for (const line of lines) {
      if (!isLikelyNoise(line) && !extractPriceFromText(line) && !detectCurrencyFromText(line)) {
        productName = line;
        break;
      }
    }
  }

  // ── Currency conversion ───────────────────────────────────────────
  const exchangeRate = await getExchangeRate();
  let priceBs: number;
  let priceUsd: number;

  if (detectedCurrency === 'BS') {
    priceBs = detectedPrice;
    priceUsd = convertBsToUsd(detectedPrice, exchangeRate);
  } else {
    priceUsd = detectedPrice;
    priceBs = convertUsdToBs(detectedPrice, exchangeRate);
  }

  // ── Confidence ────────────────────────────────────────────────────
  const totalElements = blocks.reduce(
    (sum, b) => sum + b.lines.reduce((s, l) => s + l.elements.length, 0),
    0
  );

  let confidence = 0.4;
  if (totalElements >= 3) confidence += 0.1;
  if (totalElements >= 5) confidence += 0.1;
  if (blocks.length >= 2) confidence += 0.05;
  if (bestBlockIndex >= 0) confidence += 0.1;
  if (productBlockIndex >= 0) confidence += 0.05;

  confidence = Math.round(Math.min(0.95, Math.max(0.3, confidence)) * 100) / 100;

  return {
    rawText: text,
    productName,
    price: detectedPrice,
    currency: detectedCurrency,
    priceBs,
    priceUsd,
    confidence,
  };
}

export { detectCurrencyFromText, extractPriceFromText };

export default {
  scanImage,
  preprocessImage,
  detectCurrencyFromText,
  extractPriceFromText,
};
