export function formatCurrencyBs(amount: number): string {
  return `Bs ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatCurrencyUsd(amount: number): string {
  return `$ ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(date: Date | string | number): string {
  const d = new Date(date)
  return d.toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function calculateTotal(
  items: Array<{ priceBs: number; priceUsd: number; quantity: number }>
): { totalBs: number; totalUsd: number } {
  return items.reduce(
    (acc, item) => ({
      totalBs: acc.totalBs + item.priceBs * item.quantity,
      totalUsd: acc.totalUsd + item.priceUsd * item.quantity,
    }),
    { totalBs: 0, totalUsd: 0 }
  )
}

export function convertBsToUsd(bsAmount: number, exchangeRate: number): number {
  return bsAmount / exchangeRate
}

export function convertUsdToBs(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate
}