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

export async function rotateImage(
  uri: string,
  degrees: number
): Promise<{ uri: string; width: number; height: number }> {
  const result = await manipulateAsync(uri, [{ rotate: degrees }], {
    compress: 0.9,
    format: SaveFormat.JPEG,
  });
  return { uri: result.uri, width: result.width, height: result.height };
}

function isLikelyNoise(text: string): boolean {
  if (text.length < 3) return true;
  // 6+ consecutive digits (barcodes, serials, codes)
  if (/\d{6,}/.test(text)) return true;
  // Dates: 20-06-26, 20/06/2026, 20.06.26
  if (/\b\d{1,2}[-/.]\d{1,2}[-/.]\d{2,4}\b/.test(text)) return true;
  // Package / quantity lines: "1 empaque", "2 piezas", "Cont. neto 1kg"
  if (/\b\d+\s*(empaque|paquete|pieza|unid?|und|cont\.?|peso|neto)\b/i.test(text)) return true;
  // Meta keywords at the start of a line (labels, codes, registry info).
  // Test on the original text so word boundaries hold (e.g. "EMPAQUE VENCE",
  // "Total Reft").
  if (
    /^(lote|fab|venc|fecha|serial|cod|ref|empaque|contenido|registro|ruc|nit|peso|neto|cont|hecho|elaborado|distribuido|importado|total)\b/i.test(
      text
    )
  )
    return true;
  // Pure digits / punctuation (no letters at all)
  if (!/[a-záéíóúñü]/i.test(text)) return true;
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

// ML Kit sometimes merges several prices into one block (e.g. "7.73 4,33" =
// per-kg price + total). The total usually comes last, so prefer the last
// 2-decimal number in a block over the first one.
function extractLastPriceFromText(text: string): number | null {
  const matches = text.match(/\d{1,3}(?:[.,]\d{3})*[.,]\d{2}/g);
  if (!matches || matches.length === 0) return null;
  const last = matches[matches.length - 1];
  const normalized = last
    .replace(',', '.')
    .replace(/\.(?=\d{3})/g, '')
    .replace(/,/g, '');
  const price = parseFloat(normalized);
  return isNaN(price) ? null : price;
}

function parseDecimal(s: string): number {
  const normalized = s
    .replace(',', '.')
    .replace(/\.(?=\d{3})/g, '')
    .replace(/,/g, '');
  return parseFloat(normalized);
}

// Labels sometimes print both prices on one line: "BS. 13.221,07/REF:21,41".
// Detect that and return both real amounts so we don't convert one into the
// other (which would misinterpret the dollar REF price as bolívares).
function extractDualCurrencyPrices(text: string): { bs: number; usd: number } | null {
  const hasBs = /\bbs\.?\b/i.test(text);
  const hasUsd = /\bref\.?\b|\$|usd/i.test(text);
  if (!hasBs || !hasUsd) return null;

  const bsMatch = text.match(/\bbs\.?\s*:?\s*(\d[\d.,]*)/i);
  const usdMatch =
    text.match(/\bref\.?\s*:?\s*(\d[\d.,]*)/i) ||
    text.match(/\$\s*(\d[\d.,]*)/i) ||
    text.match(/\busd\s*:?\s*(\d[\d.,]*)/i);
  if (!bsMatch || !usdMatch) return null;

  const bs = parseDecimal(bsMatch[1]);
  const usd = parseDecimal(usdMatch[1]);
  if (isNaN(bs) || isNaN(usd) || bs <= 0 || usd <= 0) return null;
  return { bs, usd };
}

// A price candidate found by the parsing helpers below.
interface PriceCandidate {
  price: number;
  currency: 'BS' | 'USD' | null;
  sourceText: string;
  blockIndex: number;
}

const PROXIMITY_RANGE = 2;

// Finds the product name block: the biggest-font block of natural text. The
// product name is almost always the largest text on the label, so font size is
// the primary signal; text length only breaks ties.
function findProductBlockIndex(sortedBlocks: TextBlock[], globalAvgHeight: number): number {
  let productBlockIndex = -1;
  let productBlockScore = -1;
  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    let textLength = 0;
    let words = 0;
    for (const line of block.lines) {
      const t = line.text.trim();
      if (
        t.length >= 3 &&
        !isLikelyNoise(t) &&
        !extractPriceFromText(t) &&
        !detectCurrencyFromText(t)
      ) {
        textLength += t.length;
        words += t.split(/\s+/).filter(Boolean).length;
      }
    }
    if (textLength < 5 || words < 2) continue;

    const fontHeight = avgElementHeight(block);
    if (fontHeight <= 0) continue;

    const ratio = fontHeight / globalAvgHeight;
    const score = Math.round(ratio * 1000) + Math.min(textLength, 100);

    if (score > productBlockScore) {
      productBlockScore = score;
      productBlockIndex = i;
    }
  }
  return productBlockIndex;
}

// Scores every block as a price candidate — prefer large font and explicit
// currency, penalize weights and per-kg "Ref" lines — and returns the best one
// (with a proximity bonus to the product name block).
function findBestPriceBlock(
  sortedBlocks: TextBlock[],
  productBlockIndex: number,
  globalAvgHeight: number,
  smallPrintThreshold: number
): PriceCandidate | null {
  let detectedPrice: number | null = null;
  let detectedCurrency: 'BS' | 'USD' | null = null;
  let priceSourceText = '';
  let bestBlockIndex = -1;
  let bestPriceScore = -99;

  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    const blockText = block.text.trim();
    const price = extractLastPriceFromText(blockText);
    const currency = detectCurrencyFromText(blockText);
    // "Ref." is a price label (Ref. KG = price/kg, Total Ref = total price), not a currency indicator
    const isRefLabel = /\bRef\.?\b/i.test(blockText);
    const isActualCurrency = currency !== null && !isRefLabel;
    let score = 0;

    if (price !== null) score += 3;
    // Explicit currency ($ / Bs) is the strongest signal of the real price.
    if (isActualCurrency) score += 8;
    if (/\d{6,}/.test(blockText)) score -= 2;
    if (blockText.length < 4) score -= 1;
    // Bare integers are less likely the final price than 2-decimal prices.
    if (/^\d{2,6}$/.test(blockText)) score -= 2;
    if (price !== null && /[.,]\d{2}(?!\d)/.test(blockText)) score += 2;
    // Weight / quantity lines ("0.440 kg", "60 kg") are not prices. Include
    // common ML Kit misreads of "kg" (e.g. "ko", "kq").
    if (/\b\d+(?:[.,]\d+)?\s*(kg|kgs|ko|kq|g|gr|ml|l|lb|oz)\b/i.test(blockText)) {
      score -= 25;
    }
    // Per-kg reference price ("Ref.KG", "Ref .KG") is not the product price.
    if (/\bref\.?\s*(kg|g|lb|kilo)\b/i.test(blockText)) {
      continue;
    }

    // Font size heuristic: small-print blocks get penalized, larger fonts get proportional bonus
    if (isSmallPrint(block, smallPrintThreshold)) {
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

    // Bonus for "Total"/"Total Ref" keyword — the final total price.
    if (/total/i.test(blockText)) {
      score += 5;
    }

    // Strong proximity bonus to the product name block.
    if (productBlockIndex >= 0) {
      const dist = Math.abs(i - productBlockIndex);
      if (dist <= PROXIMITY_RANGE) {
        score += (PROXIMITY_RANGE - dist + 1) * 3;
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

  // Lenient price fallback on blocks near the product block (bare integers).
  if (detectedPrice === null) {
    for (let i = 0; i < sortedBlocks.length; i++) {
      if (isSmallPrint(sortedBlocks[i], smallPrintThreshold)) continue;
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

  if (detectedPrice === null) return null;
  return {
    price: detectedPrice,
    currency: detectedCurrency,
    sourceText: priceSourceText,
    blockIndex: bestBlockIndex,
  };
}

// Fallback: parse the raw OCR text line by line for a price.
function findFlatTextPrice(text: string): PriceCandidate | null {
  const lines = text
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);

  let detectedPrice: number | null = null;
  let detectedCurrency: 'BS' | 'USD' | null = null;
  let priceSourceText = '';

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

  if (detectedPrice === null) return null;
  return {
    price: detectedPrice,
    currency: detectedCurrency,
    sourceText: priceSourceText,
    blockIndex: -1,
  };
}

// Last-resort fallback: ML Kit sometimes drops the last digit of a price (e.g.
// "4.33" → "4.3"). Accept the largest-font 1-2 decimal number that is not a
// weight nor a per-kg reference.
function findLenientBlockPrice(
  sortedBlocks: TextBlock[],
  smallPrintThreshold: number
): PriceCandidate | null {
  let bestLenientIndex = -1;
  let bestLenientHeight = 0;
  for (let i = 0; i < sortedBlocks.length; i++) {
    const block = sortedBlocks[i];
    if (isSmallPrint(block, smallPrintThreshold)) continue;
    const t = block.text.trim();
    if (/\b\d+(?:[.,]\d+)?\s*(kg|g|gr|ml|l|lb|oz)\b/i.test(t)) continue;
    if (/\bref\.?\s*(kg|g|lb|kilo)\b/i.test(t)) continue;
    const matches = t.match(/\d{1,3}(?:[.,]\d{1,2})/g);
    if (!matches || matches.length === 0) continue;
    const m = matches[matches.length - 1];
    const val = parseFloat(m.replace(',', '.'));
    if (isNaN(val) || val <= 0) continue;
    const h = avgElementHeight(block);
    if (h > bestLenientHeight) {
      bestLenientHeight = h;
      bestLenientIndex = i;
    }
  }
  if (bestLenientIndex >= 0) {
    const t = sortedBlocks[bestLenientIndex].text.trim();
    const matches = t.match(/\d{1,3}(?:[.,]\d{1,2})/g);
    if (matches && matches.length > 0) {
      const m = matches[matches.length - 1];
      return {
        price: parseFloat(m.replace(',', '.')),
        currency: null,
        sourceText: t,
        blockIndex: bestLenientIndex,
      };
    }
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

  // Find the product name block (biggest-font natural text).
  const productBlockIndex = findProductBlockIndex(sortedBlocks, globalAvgHeight);

  // Price selection: best scored block, then flat-text parsing, then a lenient
  // large-font fallback.
  const priceCandidate =
    findBestPriceBlock(sortedBlocks, productBlockIndex, globalAvgHeight, SMALL_PRINT_THRESHOLD) ??
    findFlatTextPrice(text) ??
    findLenientBlockPrice(sortedBlocks, SMALL_PRINT_THRESHOLD);

  const detectedPrice: number | null = priceCandidate?.price ?? null;
  let detectedCurrency: 'BS' | 'USD' | null = priceCandidate?.currency ?? null;
  const priceSourceText = priceCandidate?.sourceText ?? '';
  const bestBlockIndex = priceCandidate?.blockIndex ?? -1;

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

  // Labels sometimes show both prices on one line ("BS. 13.221,07/REF:21,41").
  // When that happens, use both real prices instead of converting one.
  const dualPrices = extractDualCurrencyPrices(priceSourceText);
  if (dualPrices) {
    priceBs = dualPrices.bs;
    priceUsd = dualPrices.usd;
  } else if (detectedCurrency === 'BS') {
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

  // ── Debug (temporary) ─────────────────────────────────────────────
  console.log('[OCR] blocks:');
  sortedBlocks.forEach((b, i) => {
    console.log(
      `  [${i}] h=${Math.round(avgElementHeight(b) * 10) / 10} name=${i === productBlockIndex} price=${i === bestBlockIndex} text="${b.text}"`
    );
  });
  console.log('[OCR] result:', {
    productName,
    price: detectedPrice,
    currency: detectedCurrency,
    priceBs,
    priceUsd,
    confidence,
  });

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
  rotateImage,
  detectCurrencyFromText,
  extractPriceFromText,
};
