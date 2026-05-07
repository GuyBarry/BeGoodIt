import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Image, User } from './index';

@Entity('body_mapping')
@Unique('uq_body_mapping_user', ['userId'])
export class BodyMapping {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'image_id', type: 'char', length: 36 })
  imageId: string;

  @Column({ name: 'picture', type: 'varchar', length: 500, nullable: true, default: null })
  picture: string | null;

  @Column({
    name: 'height_cm',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: null,
  })
  heightCm: number | null;

  @Column({
    name: 'weight_kg',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    default: null,
  })
  weightKg: number | null;

  @Column({ name: 'body_type', type: 'varchar', length: 100, nullable: true, default: null })
  bodyType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Image, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'image_id' })
  image: Image;
}
