import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('smart_buy_test')
export class SmartBuyTest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id', type: 'char', length: 36 })
  userId: string;

  @Column({ name: 'image_id', type: 'char', length: 36, nullable: true })
  imageId: string | null;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ name: 'compatibility_pct', type: 'int' })
  compatibilityPct: number;

  @Column({ name: 'match_count', type: 'int' })
  matchCount: number;

  @Column({ name: 'outfit_count', type: 'int' })
  outfitCount: number;

  @Column({ name: 'matched_items', type: 'json' })
  matchedItems: { itemId: string; matchPct: number }[];

  @Column({ type: 'json', nullable: true })
  classification: { category: string; colorGroup: string; season: string; style: string } | null;

  @CreateDateColumn({ name: 'tested_at' })
  testedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
