import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './index';

@Entity('gender')
export class Gender {
  @PrimaryGeneratedColumn({ name: 'gender_id' })
  genderId: number;

  @Column({ type: 'varchar', unique: true })
  name: string;

  @OneToMany(() => User, (user) => user.gender)
  users: User[];
}
