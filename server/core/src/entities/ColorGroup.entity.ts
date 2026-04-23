import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ClothingItem } from './index';

@Entity('color_group')
export class ColorGroup {
  @PrimaryGeneratedColumn({ name: 'id' })
  id: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => ClothingItem, (item) => item.colorGroup)
  clothingItems: ClothingItem[];
}
