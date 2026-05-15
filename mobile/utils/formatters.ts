export function formatCurrencyBs(amount: number): string {
  return `Bs ${amount.toLocaleString('es-VE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCurrencyUsd(amount: number): string {
  return `$ ${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function calculateTotal(
  products: Array<{ priceBs: number; priceUsd: number; quantity: number }>
): { totalBs: number; totalUsd: number } {
  return products.reduce(
    (acc, product) => ({
      totalBs: acc.totalBs + product.priceBs * product.quantity,
      totalUsd: acc.totalUsd + product.priceUsd * product.quantity,
    }),
    { totalBs: 0, totalUsd: 0 }
  );
}

export function convertBsToUsd(bsAmount: number, exchangeRate: number): number {
  return bsAmount / exchangeRate;
}

export function convertUsdToBs(usdAmount: number, exchangeRate: number): number {
  return usdAmount * exchangeRate;
}
