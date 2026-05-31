export function formatAmount(bs: number): string {
  return `Bs. ${bs.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
