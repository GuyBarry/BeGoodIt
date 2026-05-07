import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClothingItem } from './index';

@Entity('season')
export class Season {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => ClothingItem, (item) => item.season)
  clothingItems: ClothingItem[];
}
