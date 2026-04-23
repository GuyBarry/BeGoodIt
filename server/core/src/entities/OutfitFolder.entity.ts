import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Outfit, User } from './index';

@Entity('outfit_folder')
@Unique(['userId', 'name'])
export class OutfitFolder {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ type: 'varchar' })
  name: string;

  @ManyToOne(() => User, (user) => user.outfitFolders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Outfit, (outfit) => outfit.folder)
  outfits: Outfit[];
}
