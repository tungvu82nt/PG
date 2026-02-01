import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Match } from './match.entity';

export enum BetType {
  MATCH_WINNER = 'match_winner',
  OVER_UNDER = 'over_under',
  HANDICAP = 'handicap',
  BOTH_TEAMS_SCORE = 'both_teams_score',
  CORRECT_SCORE = 'correct_score',
  FIRST_GOAL = 'first_goal',
  TOTAL_GOALS = 'total_goals'
}

@Entity('odds')
export class Odds {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: BetType
  })
  betType: BetType;

  @Column()
  market: string; // e.g., "1X2", "Over/Under 2.5", "Asian Handicap -1"

  @Column()
  selection: string; // e.g., "Home", "Away", "Draw", "Over", "Under"

  @Column('decimal', { precision: 10, scale: 2 })
  odds: number;

  @Column({ default: true })
  isActive: boolean;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  handicap: number; // For handicap bets

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  total: number; // For over/under bets

  @Column({ name: 'match_id' })
  matchId: string;

  @ManyToOne(() => Match, match => match.odds)
  @JoinColumn({ name: 'match_id' })
  match: Match;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}