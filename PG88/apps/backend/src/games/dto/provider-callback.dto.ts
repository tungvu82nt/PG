import { IsNotEmpty, IsNumber, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TransactionType } from '../../transactions/entities/transaction.entity';

export class ProviderCallbackDto {
  @ApiProperty({ description: 'User UUID', example: 'user-uuid' })
  @IsNotEmpty()
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Game UUID', example: 'game-uuid' })
  @IsNotEmpty()
  @IsUUID()
  gameId: string;

  @ApiProperty({ description: 'Transaction Amount', example: 100 })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({
    enum: TransactionType,
    description: 'Transaction Type (BET or WIN)',
  })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({
    description: 'Transaction Reference ID (from provider)',
    example: 'tx-123456',
  })
  @IsNotEmpty()
  @IsString()
  referenceId: string;
}
