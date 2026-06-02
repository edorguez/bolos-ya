export const spanishMonths = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return `${d.getDate()} ${spanishMonths[d.getMonth()]} ${d.getFullYear()}`;
}
