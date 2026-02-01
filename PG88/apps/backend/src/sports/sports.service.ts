import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, Between } from 'typeorm';
import { Sport } from './entities/sport.entity';
import { League } from './entities/league.entity';
import { Match } from './entities/match.entity';
import { Odds } from './entities/odds.entity';
import { Bet, BetStatus } from './entities/bet.entity';
import { User } from '../users/entities/user.entity';
import { CreateBetDto } from './dto/create-bet.dto';
import { GetMatchesDto } from './dto/get-matches.dto';

@Injectable()
export class SportsService {
  constructor(
    @InjectRepository(Sport)
    private sportRepository: Repository<Sport>,
    @InjectRepository(League)
    private leagueRepository: Repository<League>,
    @InjectRepository(Match)
    private matchRepository: Repository<Match>,
    @InjectRepository(Odds)
    private oddsRepository: Repository<Odds>,
    @InjectRepository(Bet)
    private betRepository: Repository<Bet>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  /**
   * Get all sports with their leagues
   */
  async getSports() {
    return this.sportRepository.find({
      where: { isActive: true },
      relations: ['leagues'],
      order: { sortOrder: 'ASC', name: 'ASC' }
    });
  }

  /**
   * Get leagues by sport
   */
  async getLeaguesBySport(sportId: string) {
    const sport = await this.sportRepository.findOne({
      where: { id: sportId, isActive: true }
    });

    if (!sport) {
      throw new NotFoundException('Sport not found');
    }

    return this.leagueRepository.find({
      where: { sportId, isActive: true },
      relations: ['sport'],
      order: { sortOrder: 'ASC', name: 'ASC' }
    });
  }

  /**
   * Get matches with filters and pagination
   */
  async getMatches(dto: GetMatchesDto) {
    const { sportId, leagueId, status, isLive, startDate, endDate, page = 1, limit = 20 } = dto;
    
    const queryBuilder = this.matchRepository.createQueryBuilder('match')
      .leftJoinAndSelect('match.league', 'league')
      .leftJoinAndSelect('league.sport', 'sport')
      .leftJoinAndSelect('match.odds', 'odds', 'odds.isActive = :oddsActive', { oddsActive: true });

    // Apply filters
    if (sportId) {
      queryBuilder.andWhere('sport.id = :sportId', { sportId });
    }

    if (leagueId) {
      queryBuilder.andWhere('league.id = :leagueId', { leagueId });
    }

    if (status) {
      queryBuilder.andWhere('match.status = :status', { status });
    }

    if (isLive !== undefined) {
      queryBuilder.andWhere('match.isLive = :isLive', { isLive });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('match.startTime BETWEEN :startDate AND :endDate', {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      });
    } else if (startDate) {
      queryBuilder.andWhere('match.startTime >= :startDate', { startDate: new Date(startDate) });
    } else if (endDate) {
      queryBuilder.andWhere('match.startTime <= :endDate', { endDate: new Date(endDate) });
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    // Order by start time
    queryBuilder.orderBy('match.startTime', 'ASC');

    const [matches, total] = await queryBuilder.getManyAndCount();

    return {
      data: matches,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get match details with odds
   */
  async getMatchDetails(matchId: string) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['league', 'league.sport', 'odds']
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Group odds by bet type
    const groupedOdds: Record<string, Odds[]> = match.odds.reduce((acc, odds) => {
      if (!acc[odds.betType]) {
        acc[odds.betType] = [];
      }
      acc[odds.betType].push(odds);
      return acc;
    }, {} as Record<string, Odds[]>);

    return {
      ...match,
      groupedOdds
    };
  }

  /**
   * Place a bet
   */
  async placeBet(userId: string, dto: CreateBetDto, queryRunner?: QueryRunner) {
    const manager = queryRunner ? queryRunner.manager : this.betRepository.manager;
    
    // Get user with pessimistic lock
    const user = await manager.findOne(User, {
      where: { id: userId },
      lock: { mode: 'pessimistic_write' }
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify match exists and betting is active
    const match = await manager.findOne(Match, {
      where: { id: dto.matchId, isBettingActive: true }
    });

    if (!match) {
      throw new BadRequestException('Match not found or betting is closed');
    }

    // Verify odds exist and are active
    const odds = await manager.findOne(Odds, {
      where: { id: dto.oddsId, matchId: dto.matchId, isActive: true }
    });

    if (!odds) {
      throw new BadRequestException('Odds not found or inactive');
    }

    // Check if odds match (prevent odds manipulation)
    if (Math.abs(odds.odds - dto.odds) > 0.01) {
      throw new BadRequestException('Odds have changed, please refresh and try again');
    }

    // Check user balance
    if (user.balance < dto.amount) {
      throw new BadRequestException('Insufficient balance');
    }

    // Calculate potential win
    const potentialWin = dto.amount * dto.odds;

    // Deduct balance
    user.balance = Number(user.balance) - dto.amount;
    await manager.save(User, user);

    // Create bet
    const bet = manager.create(Bet, {
      userId,
      matchId: dto.matchId,
      oddsId: dto.oddsId,
      amount: dto.amount,
      odds: dto.odds,
      potentialWin,
      selection: dto.selection,
      market: dto.market,
      status: BetStatus.PENDING
    });

    return manager.save(Bet, bet);
  }

  /**
   * Get user's betting history
   */
  async getUserBets(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [bets, total] = await this.betRepository.findAndCount({
      where: { userId },
      relations: ['match', 'match.league', 'match.league.sport'],
      order: { createdAt: 'DESC' },
      skip,
      take: limit
    });

    return {
      data: bets,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Get live matches for real-time updates
   */
  async getLiveMatches() {
    return this.matchRepository.find({
      where: { isLive: true },
      relations: ['league', 'league.sport', 'odds'],
      order: { startTime: 'ASC' }
    });
  }

  /**
   * Update match score (admin function)
   */
  async updateMatchScore(matchId: string, homeScore: number, awayScore: number, minute?: number) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId }
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    if (minute !== undefined) {
      match.minute = minute;
    }

    return this.matchRepository.save(match);
  }

  /**
   * Settle bets for a finished match (admin function)
   */
  async settleBets(matchId: string) {
    const match = await this.matchRepository.findOne({
      where: { id: matchId },
      relations: ['bets']
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    const pendingBets = await this.betRepository.find({
      where: { matchId, status: BetStatus.PENDING },
      relations: ['user']
    });

    for (const bet of pendingBets) {
      const isWin = this.determineBetResult(bet, match);
      
      if (isWin) {
        bet.status = BetStatus.WON;
        // Add winnings to user balance
        bet.user.balance = Number(bet.user.balance) + bet.potentialWin;
        await this.userRepository.save(bet.user);
      } else {
        bet.status = BetStatus.LOST;
      }

      await this.betRepository.save(bet);
    }

    return { settledBets: pendingBets.length };
  }

  /**
   * Determine if a bet won based on match result
   */
  private determineBetResult(bet: Bet, match: Match): boolean {
    // This is a simplified version - in reality, you'd need more complex logic
    // for different bet types (handicap, over/under, etc.)
    
    if (bet.market === '1X2') {
      if (bet.selection === 'Home' && match.homeScore > match.awayScore) return true;
      if (bet.selection === 'Away' && match.awayScore > match.homeScore) return true;
      if (bet.selection === 'Draw' && match.homeScore === match.awayScore) return true;
    }

    // Add more bet type logic here...
    
    return false;
  }
}