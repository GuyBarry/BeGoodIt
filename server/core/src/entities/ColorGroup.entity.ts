import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cloth } from './index';

@Entity('color_group')
export class ColorGroup {
  @PrimaryGeneratedColumn({ name: 'color_id' })
  colorId: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => Cloth, (cloth) => cloth.colorGroup)
  clothes: Cloth[];
}
