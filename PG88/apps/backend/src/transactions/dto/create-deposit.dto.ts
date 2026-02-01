import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateDepositDto {
  @ApiProperty({ example: 100000, description: 'Amount to deposit' })
  @IsNumber()
  @Min(10000)
  amount: number;

  @ApiProperty({ example: 'MOMO', description: 'Payment method', required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
