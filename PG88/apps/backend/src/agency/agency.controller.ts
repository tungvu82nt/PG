import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AgencyService } from './agency.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AgencyStatsDto } from './dto/agency-stats.dto';
import { MemberListQueryDto } from './dto/member-list.query.dto';

@ApiTags('agency')
@Controller('agency')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AgencyController {
  constructor(private readonly agencyService: AgencyService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get agency dashboard statistics' })
  @ApiResponse({ status: 200, type: AgencyStatsDto })
  async getStats(@Request() req: any) {
    return this.agencyService.getDashboardStats(req.user.id);
  }

  @Get('members')
  @ApiOperation({ summary: 'Get list of downline members' })
  @ApiResponse({ status: 200, description: 'Paginated list of members' })
  async getMembers(
    @Request() req: any,
    @Query() query: MemberListQueryDto,
  ) {
    return this.agencyService.getMembers(req.user.id, query);
  }
}
