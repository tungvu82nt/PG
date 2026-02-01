import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { BankAccount } from './bank-account.entity';
import { Bet } from '../../sports/entities/bet.entity';
// import { CommissionRecord } from '../../agency/entities/commission-record.entity';

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  BANNED = 'BANNED',
}

export enum UserRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN',
  CS = 'CS', // Customer Service
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  username: string;

  @Column({ name: 'password_hash' })
  passwordHash: string;

  @Column()
  salt: string;

  @Column({ name: 'real_name', nullable: true, type: 'varchar', length: 100 })
  realName: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar', length: 20 })
  phone: string | null;

  @Column({ unique: true, nullable: true, type: 'varchar', length: 100 })
  email: string | null;

  @Column({ default: 'VND' })
  currency: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ name: 'vip_level', default: 0 })
  vipLevel: number;

  @Column({ name: 'security_level', default: 0 })
  securityLevel: number;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.MEMBER })
  role: UserRole;

  @Column({ name: 'referral_code', unique: true })
  referralCode: string;

  @Column({ name: 'referrer_id', nullable: true, type: 'uuid' })
  referrerId: string | null;

  @ManyToOne(() => User, user => user.members)
  @JoinColumn({ name: 'referrer_id' })
  referrer: User;

  @OneToMany(() => User, user => user.referrer)
  members: User[];

  @Column({ type: 'date', nullable: true })
  birthday: Date | null;

  @Column({ name: 'reset_password_token', nullable: true, type: 'varchar' })
  resetPasswordToken: string | null;

  @Column({ name: 'reset_password_expires', type: 'timestamp', nullable: true })
  resetPasswordExpires: Date | null;

  @OneToMany(() => BankAccount, (bankAccount) => bankAccount.user)
  bankAccounts: BankAccount[];

  // Sports betting relationship
  @OneToMany(() => Bet, (bet) => bet.user)
  bets: Bet[];

  // @OneToMany(() => CommissionRecord, (commission) => commission.agent)
  // commissionRecords: CommissionRecord[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

