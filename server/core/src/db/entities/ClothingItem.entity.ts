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

@Entity('clothing_item')
@Index('idx_clothing_item_user_lookups', ['userId', 'categoryId', 'colorGroupId'])
export class ClothingItem {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'color_group_id', type: 'int', nullable: true })
  colorGroupId: number | null;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  @Column({ name: 'season_id', type: 'int', nullable: true })
  seasonId: number | null;

  @Column({ name: 'image_id', type: 'char', length: 36, nullable: true })
  imageId: string | null;

  @Column({ type: 'varchar', nullable: true })
  style: string | null;

  // text-embedding-004 produces 768 float32 values = 3072 bytes, stored as VARBINARY(3072)
  @Column({ name: 'image_embedding', type: 'varbinary', length: 3072, nullable: true })
  imageEmbedding: Buffer | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.clothingItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => ColorGroup, (cg) => cg.clothingItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'color_group_id' })
  colorGroup: ColorGroup | null;

  @ManyToOne(() => GarmentCategory, (gc) => gc.clothingItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: GarmentCategory | null;

  @ManyToOne(() => Season, (s) => s.clothingItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'season_id' })
  season: Season | null;

  @ManyToMany(() => Outfit, (outfit) => outfit.items)
  outfits: Outfit[];
}
