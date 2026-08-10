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

  getByUsername(username: string): Promise<User | null> {
    return this.findOne({
      where: { username },
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

  async createPasswordUser(input: {
    username: string;
    email: string;
    passwordHash: string;
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

  async addRefreshToken(id: string, token: string): Promise<void> {
    const user = await this.findOne({ where: { id } });
    if (!user) return;
    user.refreshTokens = [...(user.refreshTokens ?? []), token];
    await this.save(user);
  },

  async replaceRefreshToken(
    id: string,
    oldToken: string,
    newToken: string,
  ): Promise<void> {
    const user = await this.findOne({ where: { id } });
    if (!user) return;
    const remaining = (user.refreshTokens ?? []).filter((t) => t !== oldToken);
    user.refreshTokens = [...remaining, newToken];
    await this.save(user);
  },

  async clearRefreshTokens(id: string): Promise<void> {
    const user = await this.findOne({ where: { id } });
    if (!user) return;
    user.refreshTokens = [];
    await this.save(user);
  },
});
