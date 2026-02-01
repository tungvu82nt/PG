import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('game_mappings')
export class GameMapping {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'original_provider_game_id' })
  originalProviderGameId: string;

  @Column({ name: 'provider_code' })
  providerCode: string;

  @Column({ name: 'mapped_uuid', unique: true })
  mappedUuid: string;

  @Column({ nullable: true })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
