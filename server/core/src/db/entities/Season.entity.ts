import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClothingItem } from './index';

@Entity('season')
export class Season {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @ManyToMany(() => ClothingItem, (item) => item.seasons)
  clothingItems: ClothingItem[];
}
