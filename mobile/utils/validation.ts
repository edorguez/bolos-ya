const INT64_MAX = 9223372036854775807;

export function parseAmount(value: string): number {
  if (!value || value.trim() === '') return 0;
  const floatVal = parseFloat(value);
  if (isNaN(floatVal) || floatVal < 0) return 0;
  return Math.round(floatVal * 100);
}

export function formatInt64Amount(value: number): string {
  return (value / 100).toFixed(2);
}

export function sanitizeName(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

export function validateName(value: string): string | null {
  if (!value || value.trim().length === 0) return 'El nombre es requerido';
  const sanitized = sanitizeName(value);
  if (sanitized.length > 100) return 'Máximo 100 caracteres';
  return null;
}

export function validateAmount(value: string): { amount: number; error: string | null } {
  if (!value || value.trim() === '') {
    return { amount: 0, error: null };
  }
  const floatVal = parseFloat(value);
  if (isNaN(floatVal) || floatVal < 0) {
    return { amount: 0, error: 'Ingresa un valor válido' };
  }
  const scaled = Math.round(floatVal * 100);
  if (scaled > INT64_MAX) {
    return { amount: 0, error: 'Valor demasiado grande' };
  }
  return { amount: scaled, error: null };
}
