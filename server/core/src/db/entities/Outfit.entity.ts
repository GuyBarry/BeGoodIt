import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClothingItem, OutfitFolder, User } from './index';

@Entity('outfit')
export class Outfit {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'folder_id', type: 'char', length: 36, nullable: true })
  folderId: string | null;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ name: 'is_favorite', type: 'boolean', default: false })
  isFavorite: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.outfits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => OutfitFolder, (folder) => folder.outfits, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'folder_id' })
  folder: OutfitFolder | null;

  @ManyToMany(() => ClothingItem, (item) => item.outfits)
  @JoinTable({
    name: 'outfit_item',
    joinColumn: { name: 'outfit_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'item_id', referencedColumnName: 'id' },
  })
  items: ClothingItem[];
}
