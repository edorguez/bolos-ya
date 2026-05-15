export const spanishMonths = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return `${d.getDate()} ${spanishMonths[d.getMonth()]} ${d.getFullYear()}`;
}
