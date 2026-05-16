import { AppDataSource } from '../db/datasource';
import { ClothingItem, Outfit } from '../db/entities';

export const outfitRepository = AppDataSource.getRepository(Outfit).extend({
  findByUserId(userId: string): Promise<Outfit[]> {
    // Uses idx_outfit_user_created composite index; loads relations in one round-trip via JOIN
    return this.find({
      where: { userId },
      relations: ['items', 'items.colorGroup', 'items.category', 'items.season'],
      order: { createdAt: 'DESC' },
    });
  },

  async findExactMatch(userId: string, itemIds: string[]): Promise<Outfit | null> {
    if (itemIds.length === 0) return null;
    const sorted = [...itemIds].sort();
    const placeholders = sorted.map(() => '?').join(',');

    // Single query: both correlated subqueries hit the idx on outfit_item.outfit_id.
    // First subquery counts how many of the requested items are in the outfit (must equal N).
    // Second subquery counts all items in the outfit (must also equal N, ruling out supersets).
    const rows: Array<{ id: string }> = await this.query(
      `SELECT o.id FROM outfit o
       WHERE o.user_id = ?
         AND o.image_id IS NOT NULL
         AND (SELECT COUNT(*) FROM outfit_item oi
              WHERE oi.outfit_id = o.id AND oi.item_id IN (${placeholders})) = ?
         AND (SELECT COUNT(*) FROM outfit_item oi
              WHERE oi.outfit_id = o.id) = ?
       LIMIT 1`,
      [userId, ...sorted, sorted.length, sorted.length],
    );

    if (rows.length === 0) return null;
    return this.findOne({ where: { id: rows[0].id } });
  },

  async createOutfit(userId: string, items: ClothingItem[], imageId: string, name?: string): Promise<Outfit> {
    const outfit = this.manager.create(Outfit, {
      userId,
      imageId,
      name: name ?? null,
      isFavorite: false,
      items,
    });
    return this.manager.save(Outfit, outfit);
  },
});
