import { IsOptional, IsString, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MatchStatus } from '../entities/match.entity';

export class GetMatchesDto {
  @ApiPropertyOptional({ description: 'Sport ID filter' })
  @IsOptional()
  @IsString()
  sportId?: string;

  @ApiPropertyOptional({ description: 'League ID filter' })
  @IsOptional()
  @IsString()
  leagueId?: string;

  @ApiPropertyOptional({ description: 'Match status filter' })
  @IsOptional()
  @IsEnum(MatchStatus)
  status?: MatchStatus;

  @ApiPropertyOptional({ description: 'Show only live matches' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isLive?: boolean;

  @ApiPropertyOptional({ description: 'Start date filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date filter (ISO string)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}