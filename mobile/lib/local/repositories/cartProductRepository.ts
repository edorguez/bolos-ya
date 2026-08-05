import { getDb, generateLocalId } from '../database';
import { CART_PRODUCT_COLUMNS, type LocalCartProduct } from './cartRepository';

export const cartProductRepository = {
  async getByCartId(cartId: string): Promise<LocalCartProduct[]> {
    const database = await getDb();
    const rows = await database.getAllAsync<LocalCartProduct>(
      `SELECT ${CART_PRODUCT_COLUMNS} FROM cart_products WHERE cart_id = ? AND deleted_at IS NULL ORDER BY created_at ASC`,
      [cartId]
    );
    return rows.map(r => ({
      ...r,
      isManualEntry: Boolean(r.isManualEntry),
    }));
  },

  async upsert(product: {
    id?: string;
    cartId: string;
    productId?: string;
    name: string;
    priceBs: number;
    priceUsd: number;
    quantity: number;
    isManualEntry?: boolean;
    imageUrl?: string | null;
    supermarket?: string;
  }): Promise<LocalCartProduct> {
    const database = await getDb();
    const id = product.id || generateLocalId();
    const now = new Date().toISOString();

    const existing = await database.getFirstAsync<LocalCartProduct>(
      `SELECT ${CART_PRODUCT_COLUMNS} FROM cart_products WHERE id = ?`,
      [id]
    );

    if (existing) {
      await database.runAsync(
        `UPDATE cart_products SET
          name = ?, price_bs = ?, price_usd = ?, quantity = ?,
          is_manual_entry = ?, image_url = ?, supermarket = ?,
          updated_at = ?
        WHERE id = ?`,
        [
          product.name,
          product.priceBs,
          product.priceUsd,
          product.quantity,
          product.isManualEntry ? 1 : 0,
          product.imageUrl || null,
          product.supermarket || '',
          now,
          id,
        ]
      );
    } else {
      await database.runAsync(
        `INSERT INTO cart_products (id, cart_id, product_id, name, price_bs, price_usd, quantity, is_manual_entry, image_url, supermarket, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          product.cartId,
          product.productId || null,
          product.name,
          product.priceBs,
          product.priceUsd,
          product.quantity,
          product.isManualEntry ? 1 : 0,
          product.imageUrl || null,
          product.supermarket || '',
          now,
          now,
        ]
      );
    }

    const saved = await database.getFirstAsync<LocalCartProduct>(
      `SELECT ${CART_PRODUCT_COLUMNS} FROM cart_products WHERE id = ?`,
      [id]
    );

    return {
      ...saved!,
      isManualEntry: Boolean(saved!.isManualEntry),
    };
  },

  async updateQuantity(id: string, quantity: number): Promise<void> {
    const database = await getDb();
    const now = new Date().toISOString();
    await database.runAsync('UPDATE cart_products SET quantity = ?, updated_at = ? WHERE id = ?', [
      quantity,
      now,
      id,
    ]);
  },

  async update(id: string, updates: Partial<LocalCartProduct>): Promise<void> {
    const database = await getDb();
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: (string | number | null)[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.priceBs !== undefined) {
      fields.push('price_bs = ?');
      values.push(updates.priceBs);
    }
    if (updates.priceUsd !== undefined) {
      fields.push('price_usd = ?');
      values.push(updates.priceUsd);
    }
    if (updates.quantity !== undefined) {
      fields.push('quantity = ?');
      values.push(updates.quantity);
    }
    if (updates.imageUrl !== undefined) {
      fields.push('image_url = ?');
      values.push(updates.imageUrl);
    }

    fields.push('updated_at = ?');
    values.push(now);
    values.push(id);

    if (fields.length > 1) {
      await database.runAsync(
        `UPDATE cart_products SET ${fields.join(', ')} WHERE id = ?`,
        values as (string | number | null)[]
      );
    }
  },

  async delete(id: string): Promise<void> {
    const database = await getDb();
    const now = new Date().toISOString();
    await database.runAsync(
      'UPDATE cart_products SET deleted_at = ?, updated_at = ? WHERE id = ?',
      [now, now, id]
    );
  },

  async getCartTotals(cartId: string): Promise<{ totalBs: number; totalUsd: number }> {
    const database = await getDb();
    const row = await database.getFirstAsync<{ totalBs: number; totalUsd: number }>(
      `SELECT COALESCE(SUM(price_bs * quantity), 0) as totalBs,
              COALESCE(SUM(price_usd * quantity), 0) as totalUsd
       FROM cart_products WHERE cart_id = ? AND deleted_at IS NULL`,
      [cartId]
    );
    return { totalBs: row?.totalBs ?? 0, totalUsd: row?.totalUsd ?? 0 };
  },
};
