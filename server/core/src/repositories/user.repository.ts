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

  getByGoogleId(googleId: string): Promise<User | null> {
    return this.findOne({
      where: { googleId },
      relations: ['gender'],
    });
  },

  getByEmail(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
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

  async createGoogleUser(input: {
    googleId: string;
    email: string;
    username: string;
    profilePictureUrl: string | null;
  }): Promise<User> {
    const user = this.create(input);
    return this.save(user);
  },

  async linkGoogleId(id: string, googleId: string): Promise<void> {
    await this.createQueryBuilder()
      .update(User)
      .set({ googleId })
      .where('id = :id', { id })
      .execute();
  },
});
