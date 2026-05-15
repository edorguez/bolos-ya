export function toCents(amount: number): number {
  return Math.round(amount * 100);
}

export function fromCents(cents: number): number {
  return cents / 100;
}

interface HasPrices {
  priceBs: number;
  priceUsd: number;
}

export function transformPrices<T extends HasPrices>(obj: T): T {
  return {
    ...obj,
    priceBs: fromCents(obj.priceBs),
    priceUsd: fromCents(obj.priceUsd),
  };
}
