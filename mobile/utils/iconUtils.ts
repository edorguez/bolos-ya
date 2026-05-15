export const ICON_POOL = ['storefront', 'store', 'shopping-cart', 'local-mall'] as const;
export const CARD_COLORS = ['emberOrange', 'meadowGreen', 'skyBlue', 'midnight'] as const;

function hashCode(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

export function getCartIcon(cartId: string): string {
  return ICON_POOL[hashCode(cartId) % ICON_POOL.length];
}

export function getCartColorKey(cartId: string): string {
  return CARD_COLORS[hashCode(cartId) % CARD_COLORS.length];
}

export function getIconByIndex(index: number): string {
  return ICON_POOL[index % ICON_POOL.length];
}
