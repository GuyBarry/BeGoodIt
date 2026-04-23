import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClothingItem } from './index';

@Entity('garment_category')
export class GarmentCategory {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => ClothingItem, (item) => item.category)
  clothingItems: ClothingItem[];
}
