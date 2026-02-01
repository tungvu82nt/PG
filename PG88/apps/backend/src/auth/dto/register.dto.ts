import { IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'player123', description: 'Username (5-13 chars, alphanumeric)' })
  @IsString()
  @MinLength(5)
  @MaxLength(13)
  @Matches(/^[a-zA-Z0-9]+$/, { message: 'Username must confirm to alphanumeric rules' })
  username: string;

  @ApiProperty({ example: 'password123', description: 'Password (min 6 chars)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'NGUYEN VAN A', description: 'Real Name (Uppercase)' })
  @IsOptional()
  @IsString()
  realName: string;

  @ApiProperty({ example: '0901234567', description: 'Phone Number' })
  @IsOptional()
  @IsString()
  phone: string;

  @ApiProperty({ required: false, description: 'Affiliate ID' })
  @IsOptional()
  @IsString()
  affiliateId?: string;
}
