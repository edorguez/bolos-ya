export const ICON_POOL = ['storefront', 'store', 'shopping-cart', 'local-mall'] as const;
export const CARD_COLORS = ['emberOrange', 'meadowGreen', 'skyBlue', 'midnight'] as const;

export function getIconByIndex(index: number): string {
  return ICON_POOL[index % ICON_POOL.length];
}
