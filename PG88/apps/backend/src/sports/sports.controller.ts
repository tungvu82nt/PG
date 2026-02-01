import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SportsService } from './sports.service';
import { CreateBetDto } from './dto/create-bet.dto';
import { GetMatchesDto } from './dto/get-matches.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DataSource } from 'typeorm';

@ApiTags('Sports')
@Controller('api/v1/sports')
export class SportsController {
  constructor(
    private readonly sportsService: SportsService,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all sports with leagues' })
  @ApiResponse({ status: 200, description: 'Sports retrieved successfully' })
  async getSports() {
    return this.sportsService.getSports();
  }

  @Get(':sportId/leagues')
  @ApiOperation({ summary: 'Get leagues by sport' })
  @ApiResponse({ status: 200, description: 'Leagues retrieved successfully' })
  async getLeaguesBySport(@Param('sportId') sportId: string) {
    return this.sportsService.getLeaguesBySport(sportId);
  }

  @Get('matches')
  @ApiOperation({ summary: 'Get matches with filters and pagination' })
  @ApiResponse({ status: 200, description: 'Matches retrieved successfully' })
  async getMatches(@Query() dto: GetMatchesDto) {
    return this.sportsService.getMatches(dto);
  }

  @Get('matches/live')
  @ApiOperation({ summary: 'Get live matches' })
  @ApiResponse({ status: 200, description: 'Live matches retrieved successfully' })
  async getLiveMatches() {
    return this.sportsService.getLiveMatches();
  }

  @Get('matches/:matchId')
  @ApiOperation({ summary: 'Get match details with odds' })
  @ApiResponse({ status: 200, description: 'Match details retrieved successfully' })
  async getMatchDetails(@Param('matchId') matchId: string) {
    return this.sportsService.getMatchDetails(matchId);
  }

  @Post('bets')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Place a bet' })
  @ApiResponse({ status: 201, description: 'Bet placed successfully' })
  @ApiResponse({ status: 400, description: 'Invalid bet data or insufficient balance' })
  async placeBet(@Request() req: any, @Body() dto: CreateBetDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const bet = await this.sportsService.placeBet(req.user.id, dto, queryRunner);
      await queryRunner.commitTransaction();
      return bet;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  @Get('bets/my')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user betting history' })
  @ApiResponse({ status: 200, description: 'Betting history retrieved successfully' })
  async getUserBets(
    @Request() req: any,
    @Query('page') page = 1,
    @Query('limit') limit = 20
  ) {
    return this.sportsService.getUserBets(req.user.id, Number(page), Number(limit));
  }
}