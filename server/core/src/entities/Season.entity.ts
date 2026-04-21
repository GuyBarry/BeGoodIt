import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cloth } from './index';

@Entity('season')
export class Season {
  @PrimaryGeneratedColumn({ name: 'season_id' })
  seasonId: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => Cloth, (cloth) => cloth.season)
  clothes: Cloth[];
}
