import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Cloth, Outfit, OutfitFolder } from './index';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  userId: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ name: 'profile_picture_url', type: 'text', nullable: true })
  profilePictureUrl: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  gender: string | null;

  @Column({ type: 'date', nullable: true })
  birthdate: Date | null;

  @Column({
    name: 'height_cm',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  heightCm: number | null;

  @Column({ name: 'body_type', type: 'varchar', length: 50, nullable: true })
  bodyType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => OutfitFolder, (folder) => folder.user)
  outfitFolders: OutfitFolder[];

  @OneToMany(() => Cloth, (cloth) => cloth.user)
  clothes: Cloth[];

  @OneToMany(() => Outfit, (outfit) => outfit.user)
  outfits: Outfit[];
}
