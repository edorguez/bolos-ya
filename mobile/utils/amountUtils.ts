export function formatAmountInput(rawDigits: string): string {
  if (rawDigits.length === 0) return '';
  const num = parseInt(rawDigits, 10);
  const value = (num / 100).toFixed(2);
  const [intPart, decPart] = value.split('.');
  const withThousands = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${withThousands},${decPart}`;
}

export function parseAmountInput(rawDigits: string): number {
  if (rawDigits.length === 0) return 0;
  return parseInt(rawDigits, 10) / 100;
}

export function sanitizeAmountInput(text: string, maxDigits = 14): string {
  return text.replace(/\D/g, '').slice(0, maxDigits);
}
