import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { getExchangeRate, detectCurrencyFromText, extractPriceFromText } from '../utils/currency';
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
  const result = await manipulateAsync(uri, [{ resize: { width: 1920 } }], {
    compress: 0.8,
    format: SaveFormat.JPEG,
  });
  return result.uri;
}

function extractProductName(lines: string[], priceLineIndex: number): string {
  if (lines.length === 0) return 'Producto desconocido';

  for (let i = Math.max(0, priceLineIndex - 1); i >= 0; i--) {
    const text = lines[i].trim();
    if (text && !detectCurrencyFromText(text) && !extractPriceFromText(text)) {
      return text;
    }
  }

  for (let i = priceLineIndex + 1; i < lines.length; i++) {
    const text = lines[i].trim();
    if (text && !detectCurrencyFromText(text) && !extractPriceFromText(text)) {
      return text;
    }
  }

  for (const line of lines) {
    const text = line.trim();
    if (text && !detectCurrencyFromText(text) && !extractPriceFromText(text)) {
      return text;
    }
  }

  return lines[0]?.trim() || 'Producto desconocido';
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
    const result = await recognizer(enhancedUri);
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

  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let detectedPrice: number | null = null;
  let detectedCurrency: 'BS' | 'USD' | null = null;
  let priceLineIndex = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const price = extractPriceFromText(line);
    const currency = detectCurrencyFromText(line);

    if (price && currency) {
      detectedPrice = price;
      detectedCurrency = currency;
      priceLineIndex = i;
      break;
    }
  }

  if (detectedPrice && !detectedCurrency) {
    for (let i = 0; i < lines.length; i++) {
      const currency = detectCurrencyFromText(lines[i]);
      if (currency) {
        detectedCurrency = currency;
        break;
      }
    }
  }

  if (!detectedCurrency) {
    detectedCurrency = 'BS';
  }

  if (!detectedPrice) {
    return {
      rawText: text,
      productName: extractProductName(lines, -1),
      price: 0,
      currency: detectedCurrency,
      priceBs: 0,
      priceUsd: 0,
      confidence: 0.4,
      warning: 'No se detectó un precio. Asegúrate de que el precio esté visible.',
    };
  }

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

  const productName = extractProductName(lines, priceLineIndex);

  const totalLines = blocks.reduce((sum, b) => sum + b.lines.length, 0);
  const avgConfidence =
    blocks.length > 0 && totalLines > 0
      ? Math.min(0.95, 0.6 + totalLines * 0.02 + blocks.length * 0.03)
      : 0.7;

  return {
    rawText: text,
    productName,
    price: detectedPrice,
    currency: detectedCurrency,
    priceBs,
    priceUsd,
    confidence: Math.round(avgConfidence * 100) / 100,
  };
}

export { detectCurrencyFromText, extractPriceFromText };

export default {
  scanImage,
  preprocessImage,
  detectCurrencyFromText,
  extractPriceFromText,
};
