import { ApiProperty } from '@nestjs/swagger';

export class AgencyStatsDto {
  @ApiProperty({ example: 10, description: 'Total number of direct downline members' })
  totalMembers: number;

  @ApiProperty({ example: 150.50, description: 'Estimated commission for today' })
  todayCommission: number;

  @ApiProperty({ example: 5000.00, description: 'Total commission earned all time' })
  totalCommission: number;
}
