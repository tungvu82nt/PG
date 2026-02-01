import { IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBetDto {
  @ApiProperty({ description: 'Match ID' })
  @IsNotEmpty()
  @IsUUID()
  matchId: string;

  @ApiProperty({ description: 'Odds ID' })
  @IsNotEmpty()
  @IsUUID()
  oddsId: string;

  @ApiProperty({ description: 'Bet amount', minimum: 1 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  amount: number;

  @ApiProperty({ description: 'Selection (e.g., Home, Away, Over)' })
  @IsNotEmpty()
  @IsString()
  selection: string;

  @ApiProperty({ description: 'Market type (e.g., 1X2, Over/Under)' })
  @IsNotEmpty()
  @IsString()
  market: string;

  @ApiProperty({ description: 'Odds value' })
  @IsNotEmpty()
  @IsNumber()
  @Min(1.01)
  odds: number;
}