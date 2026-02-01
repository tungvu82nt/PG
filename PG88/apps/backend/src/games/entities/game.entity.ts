import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum GameCategory {
  SLOT = 'SLOT',
  LIVE = 'LIVE',
  FISH = 'FISH',
  SPORTS = 'SPORTS',
  CARD = 'CARD',
  LOTTERY = 'LOTTERY',
}

@Entity('games')
export class Game {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'provider_code' })
  providerCode: string;

  @Column({ name: 'game_code' })
  gameCode: string;

  @Column({ name: 'name_vi' })
  nameVi: string;

  @Column({ name: 'name_en' })
  nameEn: string;

  @Column({ name: 'image_url', nullable: true })
  imageUrl: string;

  @Column({ type: 'enum', enum: GameCategory })
  category: GameCategory;

  @Column({ default: true })
  status: boolean;

  @Column({ name: 'is_hot', default: false })
  isHot: boolean;

  @Column({ name: 'is_new', default: false })
  isNew: boolean;

  @Column({ name: 'jackpot_enabled', default: false })
  jackpotEnabled: boolean;

  @Column({ name: 'max_bet', type: 'decimal', precision: 15, scale: 2, nullable: true })
  maxBet: number;

  @Column({ name: 'min_bet', type: 'decimal', precision: 15, scale: 2, nullable: true })
  minBet: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
