import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat, type Action } from 'expo-image-manipulator';
import {
  getExchangeRate,
  detectCurrencyFromText,
  extractPriceFromText,
  guessCurrencyFromPrice,
} from '../utils/currency';
import { convertBsToUsd, convertUsdToBs } from '../utils/formatters';

export interface ScanResult {
  productName: string | null;
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
  lines: {
    text: string;
    frame: { left: number; top: number; right: number; bottom: number };
    recognizedLanguages: string[];
    elements: {
      text: string;
      frame: { left: number; top: number; right: number; bottom: number };
    }[];
  }[];
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
    productName: 'Arroz Paddy',
    price: priceBs,
    currency: 'BS',
    priceBs,
    priceUsd,
    confidence: 0.95,
  };
}

export async function preprocessImage(
  uri: string,
  crop?: { originX: number; originY: number; width: number; height: number }
): Promise<string> {
  try {
    const actions: Action[] = [];
    if (crop) actions.push({ crop });
    actions.push({ resize: { width: 1200 } });
    const result = await manipulateAsync(uri, actions, {
      compress: 0.8,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch {
    return uri;
  }
}

function isLikelyNoise(text: string): boolean {
  if (text.length < 3) return true;
  if (/\d{6,}/.test(text)) return true;
  if (/^(lote|fab|venc|fecha|serial|cod|ref)\s*:?\s*\d+$/i.test(text.replace(/\s/g, '')))
    return true;
  return false;
}

function avgElementHeight(block: TextBlock): number {
  const heights: number[] = [];
  for (const line of block.lines) {
    for (const el of line.elements) {
      if (el.frame && el.frame.bottom != null && el.frame.top != null) {
        heights.push(el.frame.bottom - el.frame.top);
      }
    }
  }
  if (heights.length === 0) return 0;
  return heights.reduce((a, b) => a + b, 0) / heights.length;
}

function isSmallPrint(block: TextBlock, threshold: number): boolean {
  const h = avgElementHeight(block);
  if (h === 0) return false;
  return h < threshold;
}

function hasPricePatternOnly(text: string): boolean {
  const cleaned = text.replace(/\s/g, '');
  return /^\d+[.,]\d{2}$/.test(cleaned) || /^[\d{2,6}$]/.test(cleaned);
}

function collectProductNameLines(blocks: TextBlock[], anchorIndex: number): string[] {
  if (anchorIndex < 0) return [];
  const result: string[] = [];

  const anchorFontSize = avgElementHeight(blocks[anchorIndex]);

  for (const line of blocks[anchorIndex].lines) {
    const t = line.text.trim();
    if (!isLikelyNoise(t) && !extractPriceFromText(t) && !detectCurrencyFromText(t)) {
      result.push(t);
    }
  }

  const checkAdjacent = (idx: number) => {
    if (idx < 0 || idx >= blocks.length) return;
    const adjFontSize = avgElementHeight(blocks[idx]);
    if (adjFontSize === 0 || anchorFontSize === 0) return;
    if (Math.abs(adjFontSize - anchorFontSize) / anchorFontSize > 0.4) return;
    for (const line of blocks[idx].lines) {
      const t = line.text.trim();
      if (!isLikelyNoise(t) && !extractPriceFromText(t) && !detectCurrencyFromText(t)) {
        if (idx < anchorIndex) {
          result.unshift(t);
        } else {
          result.push(t);
        }
      }
    }
  };

  checkAdjacent(anchorIndex - 1);
  checkAdjacent(anchorIndex + 1);

  return result;
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
      productName: null,
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
      productName: null,
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

  // Compute global average font size for small-print threshold
  const globalAvgHeight =
    sortedBlocks.reduce((sum, b) => sum + avgElementHeight(b), 0) / sortedBlocks.length;
  const SMALL_PRINT_THRESHOLD = globalAvgHeight * 0.6;

  // Find product name block (largest block of natural text, weighted by font size)
  let productBlockIndex = -1;
  let productBlockScore = 0;
  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    let score = 0;
    for (const line of block.lines) {
      const t = line.text.trim();
      if (
        t.length >= 5 &&
        !isLikelyNoise(t) &&
        !extractPriceFromText(t) &&
        !detectCurrencyFromText(t)
      ) {
        score += t.length;
      }
    }
    // Boost blocks with larger font (more likely product name)
    const fontHeight = avgElementHeight(block);
    if (fontHeight > 0 && fontHeight >= globalAvgHeight) {
      score = Math.round(score * (1 + fontHeight / globalAvgHeight));
    }
    if (score > productBlockScore) {
      productBlockScore = score;
      productBlockIndex = i;
    }
  }

  // Score blocks for price — prefer large font, penalize small print
  const PROXIMITY_RANGE = 2;
  let detectedPrice: number | null = null;
  let detectedCurrency: 'BS' | 'USD' | null = null;
  let priceSourceText = '';
  let bestBlockIndex = -1;
  let bestPriceScore = -99;

  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    const blockText = block.text.trim();
    const price = extractPriceFromText(blockText);
    const currency = detectCurrencyFromText(blockText);
    // "Ref." is a price label (Ref. KG = price/kg, Total Ref = total price), not a currency indicator
    const isRefLabel = /\bRef\.?\b/i.test(blockText);
    const isActualCurrency = currency !== null && !isRefLabel;
    let score = 0;

    if (price !== null) score += 3;
    if (isActualCurrency) score += 2;
    if (/\d{6,}/.test(blockText)) score -= 2;
    if (blockText.length < 4) score -= 1;
    if (/^\d{2,6}$/.test(blockText)) score += 1;

    // Font size heuristic: small-print blocks get penalized, larger fonts get proportional bonus
    if (isSmallPrint(block, SMALL_PRINT_THRESHOLD)) {
      score -= 3;
    } else if (avgElementHeight(block) > 0) {
      const fontHeight = avgElementHeight(block);
      const ratio = fontHeight / globalAvgHeight;
      // Proportional font bonus: bigger font = higher score
      score += Math.round(2 * ratio);
    }

    // Penalize bare price-only lines (likely unit price / tax, not final)
    if (price !== null && !isActualCurrency && hasPricePatternOnly(blockText)) {
      score -= 1;
    }

    // Bonus for "Total" keyword — indicates final price over unit price
    if (/total/i.test(blockText)) {
      score += 1;
    }

    if (productBlockIndex >= 0) {
      const dist = Math.abs(i - productBlockIndex);
      if (dist <= PROXIMITY_RANGE) {
        score += PROXIMITY_RANGE - dist;
      }
    }

    if (price !== null && score > bestPriceScore) {
      bestPriceScore = score;
      detectedPrice = price;
      detectedCurrency = isActualCurrency ? currency : null;
      priceSourceText = blockText;
      bestBlockIndex = i;
    }
  }

  // ── Lenient price fallback on blocks near product block ─────────
  if (detectedPrice === null) {
    for (let i = 0; i < sortedBlocks.length; i++) {
      if (isSmallPrint(sortedBlocks[i], SMALL_PRINT_THRESHOLD)) continue;
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
      productName: null,
      price: 0,
      currency: detectedCurrency,
      priceBs: 0,
      priceUsd: 0,
      confidence: 0.3,
      warning: 'No se detectó un precio. Asegúrate de que el precio esté visible.',
    };
  }

  // ── Product name ──────────────────────────────────────────────────
  let productName: string | null = null;
  const nameLines = collectProductNameLines(sortedBlocks, productBlockIndex);
  if (nameLines.length > 0) {
    productName = nameLines.join(' ');
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
  // Bonus if price block has large font (confirmed main price)
  if (bestBlockIndex >= 0 && !isSmallPrint(sortedBlocks[bestBlockIndex], SMALL_PRINT_THRESHOLD)) {
    confidence += 0.05;
  }
  // Bonus for multi-line product name (more info captured)
  if (nameLines.length >= 2) confidence += 0.05;

  confidence = Math.round(Math.min(0.95, Math.max(0.3, confidence)) * 100) / 100;

  return {
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
