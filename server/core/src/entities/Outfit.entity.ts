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
import { Cloth, OutfitFolder, User } from './index';

@Entity('outfit')
export class Outfit {
  @PrimaryGeneratedColumn('uuid', { name: 'outfit_id' })
  outfitId: string;

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

  @ManyToMany(() => Cloth, (cloth) => cloth.outfits)
  @JoinTable({
    name: 'outfit_item',
    joinColumn: { name: 'outfit_id', referencedColumnName: 'outfitId' },
    inverseJoinColumn: { name: 'item_id', referencedColumnName: 'itemId' },
  })
  items: Cloth[];
}
