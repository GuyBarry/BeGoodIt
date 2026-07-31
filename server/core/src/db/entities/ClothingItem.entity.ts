import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ColorGroup, GarmentCategory, Outfit, Season, Style, User } from './index';

@Entity('clothing_item')
@Index('idx_clothing_item_user_category', ['userId', 'categoryId'])
export class ClothingItem {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'category_id', type: 'int', nullable: true })
  categoryId: number | null;

  @Column({ name: 'image_id', type: 'char', length: 36, nullable: true })
  imageId: string | null;

  // text-embedding-004 produces 768 float32 values = 3072 bytes, stored as VARBINARY(3072)
  @Column({ name: 'image_embedding', type: 'varbinary', length: 3072, nullable: true })
  imageEmbedding: Buffer | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.clothingItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => GarmentCategory, (gc) => gc.clothingItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'category_id' })
  category: GarmentCategory | null;

  @ManyToMany(() => ColorGroup, (cg) => cg.clothingItems)
  @JoinTable({
    name: 'clothing_item_color_groups',
    joinColumn: { name: 'clothing_item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'color_group_id', referencedColumnName: 'id' },
  })
  colorGroups: ColorGroup[];

  @ManyToMany(() => Season, (s) => s.clothingItems)
  @JoinTable({
    name: 'clothing_item_seasons',
    joinColumn: { name: 'clothing_item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'season_id', referencedColumnName: 'id' },
  })
  seasons: Season[];

  @ManyToMany(() => Style, (s) => s.clothingItems)
  @JoinTable({
    name: 'clothing_item_styles',
    joinColumn: { name: 'clothing_item_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'style_id', referencedColumnName: 'id' },
  })
  styles: Style[];

  @ManyToMany(() => Outfit, (outfit) => outfit.items)
  outfits: Outfit[];
}
