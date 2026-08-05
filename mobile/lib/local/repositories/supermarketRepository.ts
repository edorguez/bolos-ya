import { getDb, generateLocalId } from '../database';

export interface LocalSupermarket {
  id: string;
  name: string;
  isCustom: boolean;
  imageUrl: string | null;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

// expo-sqlite returns rows keyed by snake_case column names; alias them so the
// camelCase interface fields are populated.
const SUPERMARKET_COLUMNS = `id, name, is_custom AS isCustom, image_url AS imageUrl, user_id AS userId, created_at AS createdAt, updated_at AS updatedAt, deleted_at AS deletedAt`;

export const supermarketRepository = {
  async getAll(): Promise<LocalSupermarket[]> {
    const database = await getDb();
    const rows = await database.getAllAsync<LocalSupermarket>(
      `SELECT ${SUPERMARKET_COLUMNS} FROM supermarkets WHERE deleted_at IS NULL ORDER BY is_custom ASC, name ASC`
    );
    return rows.map(r => ({
      ...r,
      isCustom: Boolean(r.isCustom),
    }));
  },

  async getById(id: string): Promise<LocalSupermarket | null> {
    const database = await getDb();
    const row = await database.getFirstAsync<LocalSupermarket>(
      `SELECT ${SUPERMARKET_COLUMNS} FROM supermarkets WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    if (!row) return null;
    return { ...row, isCustom: Boolean(row.isCustom) };
  },

  async upsert(supermarket: {
    id: string;
    name: string;
    isCustom?: boolean;
    imageUrl?: string | null;
    userId?: string | null;
  }): Promise<LocalSupermarket> {
    const database = await getDb();
    const now = new Date().toISOString();

    const existing = await database.getFirstAsync<LocalSupermarket>(
      `SELECT ${SUPERMARKET_COLUMNS} FROM supermarkets WHERE id = ?`,
      [supermarket.id]
    );

    if (existing) {
      await database.runAsync(
        `UPDATE supermarkets SET name = ?, is_custom = ?, image_url = ?, updated_at = ? WHERE id = ?`,
        [
          supermarket.name,
          supermarket.isCustom ? 1 : 0,
          supermarket.imageUrl || null,
          now,
          supermarket.id,
        ]
      );
    } else {
      await database.runAsync(
        `INSERT INTO supermarkets (id, name, is_custom, image_url, user_id, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          supermarket.id,
          supermarket.name,
          supermarket.isCustom ? 1 : 0,
          supermarket.imageUrl || null,
          supermarket.userId || null,
          now,
          now,
        ]
      );
    }

    return (await this.getById(supermarket.id))!;
  },

  async cacheAll(supermarkets: LocalSupermarket[]): Promise<void> {
    const database = await getDb();
    const now = new Date().toISOString();

    for (const s of supermarkets) {
      const existing = await database.getFirstAsync<LocalSupermarket>(
        `SELECT ${SUPERMARKET_COLUMNS} FROM supermarkets WHERE id = ?`,
        [s.id]
      );

      if (existing) {
        await database.runAsync(
          `UPDATE supermarkets SET name = ?, is_custom = ?, image_url = ?, updated_at = ? WHERE id = ?`,
          [s.name, s.isCustom ? 1 : 0, s.imageUrl || null, now, s.id]
        );
      } else {
        await database.runAsync(
          `INSERT INTO supermarkets (id, name, is_custom, image_url, user_id, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [s.id, s.name, s.isCustom ? 1 : 0, s.imageUrl || null, s.userId || null, now, now]
        );
      }
    }
  },

  async createCustom(name: string, userId?: string): Promise<LocalSupermarket> {
    const id = generateLocalId();
    return this.upsert({ id, name, isCustom: true, userId });
  },

  async replaceId(oldId: string, newId: string): Promise<void> {
    const database = await getDb();
    await database.runAsync('UPDATE carts SET supermarket_id = ? WHERE supermarket_id = ?', [
      newId,
      oldId,
    ]);
    await database.runAsync('DELETE FROM supermarkets WHERE id = ?', [oldId]);
  },
};
