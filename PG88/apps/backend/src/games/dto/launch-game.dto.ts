import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LaunchGameDto {
  @ApiProperty({ description: 'The UUID of the game to launch', example: 'uuid-string' })
  @IsNotEmpty()
  @IsString()
  gameId: string;
}
