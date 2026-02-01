import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from './match.entity';
import { Odds } from './odds.entity';

export enum BetStatus {
  PENDING = 'pending',
  WON = 'won',
  LOST = 'lost',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded'
}

@Entity('bets')
export class Bet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @Column('decimal', { precision: 10, scale: 2 })
  odds: number;

  @Column('decimal', { precision: 10, scale: 2 })
  potentialWin: number;

  @Column({
    type: 'enum',
    enum: BetStatus,
    default: BetStatus.PENDING
  })
  status: BetStatus;

  @Column()
  selection: string; // What the user bet on

  @Column()
  market: string; // Type of bet

  @Column({ nullable: true })
  result: string; // Actual result

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'match_id' })
  matchId: string;

  @Column({ name: 'odds_id' })
  oddsId: string;

  @ManyToOne(() => User, user => user.bets)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Match, match => match.bets)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @ManyToOne(() => Odds, odds => odds.id)
  @JoinColumn({ name: 'odds_id' })
  oddsData: Odds;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}