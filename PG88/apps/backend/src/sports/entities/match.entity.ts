import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { League } from './league.entity';
import { Bet } from './bet.entity';
import { Odds } from './odds.entity';

export enum MatchStatus {
  SCHEDULED = 'scheduled',
  LIVE = 'live',
  FINISHED = 'finished',
  CANCELLED = 'cancelled',
  POSTPONED = 'postponed'
}

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  homeTeam: string;

  @Column()
  awayTeam: string;

  @Column({ nullable: true })
  homeTeamLogo: string;

  @Column({ nullable: true })
  awayTeamLogo: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({
    type: 'enum',
    enum: MatchStatus,
    default: MatchStatus.SCHEDULED
  })
  status: MatchStatus;

  @Column({ nullable: true })
  homeScore: number;

  @Column({ nullable: true })
  awayScore: number;

  @Column({ nullable: true })
  minute: number;

  @Column({ default: false })
  isLive: boolean;

  @Column({ default: true })
  isBettingActive: boolean;

  @Column({ name: 'league_id' })
  leagueId: string;

  @ManyToOne(() => League, league => league.matches)
  @JoinColumn({ name: 'league_id' })
  league: League;

  @OneToMany(() => Bet, bet => bet.match)
  bets: Bet[];

  @OneToMany(() => Odds, odds => odds.match)
  odds: Odds[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}