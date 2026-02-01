import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum WithdrawalAction {
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
}

export class ReviewWithdrawalDto {
  @ApiProperty({ enum: WithdrawalAction })
  @IsEnum(WithdrawalAction)
  action: WithdrawalAction;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  reason?: string;
}
