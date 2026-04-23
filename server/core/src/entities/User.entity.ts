import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ClothingItem, Gender, Outfit, OutfitFolder } from './index';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ type: 'varchar', unique: true })
  username: string;

  @Column({ type: 'varchar', unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ name: 'profile_picture_url', type: 'text', nullable: true })
  profilePictureUrl: string | null;

  @Column({ name: 'gender_id', type: 'int', nullable: true })
  genderId: number | null;

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

  @Column({ name: 'body_type', type: 'varchar', nullable: true })
  bodyType: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Gender, (gender) => gender.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'gender_id' })
  gender: Gender | null;

  @OneToMany(() => OutfitFolder, (folder) => folder.user)
  outfitFolders: OutfitFolder[];

  @OneToMany(() => ClothingItem, (item) => item.user)
  clothingItems: ClothingItem[];

  @OneToMany(() => Outfit, (outfit) => outfit.user)
  outfits: Outfit[];
}
