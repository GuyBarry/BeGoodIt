import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cloth } from './index';

@Entity('garment_category')
export class GarmentCategory {
  @PrimaryGeneratedColumn({ name: 'category_id' })
  categoryId: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => Cloth, (cloth) => cloth.category)
  clothes: Cloth[];
}
