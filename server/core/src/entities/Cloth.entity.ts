import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ColorGroup, GarmentCategory, Outfit, Season, User } from './index';

@Entity('cloth')
@Index('idx_cloth_user_lookups', ['userId', 'categoryId', 'colorGroupId'])
export class Cloth {
  @PrimaryGeneratedColumn('uuid', { name: 'item_id' })
  itemId: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'color_group_id', type: 'int', nullable: true })
  colorGroupId: number | null;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  @Column({ name: 'season_id', type: 'int', nullable: true })
  seasonId: number | null;

  @Column({ name: 'image_url', type: 'text' })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  style: string | null;

  /**
   * AI visual embedding for similarity search.
   * Maps to VECTOR(1536) in MySQL 9.0+.
   * Stored as LONGBLOB at the TypeORM mapping level;
   * set the actual column type to VECTOR(1536) via a raw migration.
   */
  @Column({ name: 'image_embedding', type: 'longblob', nullable: true })
  imageEmbedding: Buffer | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.clothes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ColorGroup, (cg) => cg.clothes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'color_group_id' })
  colorGroup: ColorGroup | null;

  @ManyToOne(() => GarmentCategory, (gc) => gc.clothes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: GarmentCategory | null;

  @ManyToOne(() => Season, (s) => s.clothes, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'season_id' })
  season: Season | null;

  @ManyToMany(() => Outfit, (outfit) => outfit.items)
  outfits: Outfit[];
}
