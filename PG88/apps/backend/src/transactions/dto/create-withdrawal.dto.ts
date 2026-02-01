import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateWithdrawalDto {
  @ApiProperty({ example: 50000, description: 'Amount to withdraw' })
  @IsNumber()
  @Min(50000)
  amount: number;

  @ApiProperty({ example: 'uuid-of-bank-account', description: 'ID of the user bank account' })
  @IsString()
  @IsNotEmpty()
  bankAccountId: string;
}
