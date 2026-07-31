import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClothingItem } from './index';

@Entity('style')
export class Style {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @ManyToMany(() => ClothingItem, (item) => item.styles)
  clothingItems: ClothingItem[];
}
