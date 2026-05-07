import { AppDataSource } from '../db/datasource';
import { User } from '../db/entities';
import { UpdateUserDto } from '../dtos';

export const userRepository = AppDataSource.getRepository(User).extend({
  getById(id: string): Promise<User | null> {
    return this.findOne({
      where: { id },
      relations: ['gender'],
    });
  },

  async update(id: string, data: UpdateUserDto): Promise<User | null> {
    await this.createQueryBuilder()
      .update(User)
      .set(data)
      .where('id = :id', { id })
      .execute();
    return this.findOne({
      where: { id },
      relations: ['gender'],
    });
  },
});
