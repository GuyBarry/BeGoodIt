import { AppDataSource } from '../db/datasource';
import { SmartBuyTest } from '../db/entities/SmartBuyTest.entity';

const MAX_TESTS_PER_USER = 6;

export const smartBuyTestRepository = AppDataSource.getRepository(SmartBuyTest).extend({
  getByUserId(userId: string): Promise<SmartBuyTest[]> {
    return this.find({
      where: { userId },
      order: { testedAt: 'DESC' },
      take: MAX_TESTS_PER_USER,
    });
  },

  async pruneOldTests(userId: string): Promise<void> {
    const all = await this.find({
      where: { userId },
      order: { testedAt: 'DESC' },
      select: ['id'],
    });
    if (all.length >= MAX_TESTS_PER_USER) {
      const toDelete = all.slice(MAX_TESTS_PER_USER - 1).map(t => t.id);
      await this.delete(toDelete);
    }
  },
});
