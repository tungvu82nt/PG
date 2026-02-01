import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Game } from './entities/game.entity';
import { GameQueryDto } from './dto/game-query.dto';
import { LaunchGameDto } from './dto/launch-game.dto';
import { ProviderCallbackDto } from './dto/provider-callback.dto';
import { TransactionsService } from '../transactions/transactions.service';
import { CacheService } from '../common/services/cache.service';
import { Cache } from '../common/decorators/cache.decorator';

@Injectable()
export class GamesService {
  constructor(
    @InjectRepository(Game)
    private readonly gameRepository: Repository<Game>,
    private readonly transactionsService: TransactionsService,
    private readonly cacheService: CacheService,
  ) {}

  @Cache({ ttl: 10 * 60 * 1000 }) // Cache for 10 minutes
  async findAll(query: GameQueryDto) {
    const { page = 1, limit = 20, providerCode, category, search } = query;
    const skip = (page - 1) * limit;

    // Create cache key based on query parameters
    const cacheKey = `games:list:${JSON.stringify(query)}`;
    
    return this.cacheService.getOrSet(cacheKey, async () => {
      const qb = this.gameRepository.createQueryBuilder('game');

      if (providerCode) {
        qb.andWhere('game.providerCode = :providerCode', { providerCode });
      }

      if (category) {
        qb.andWhere('game.category = :category', { category });
      }

      if (search) {
        qb.andWhere('(game.nameEn ILIKE :search OR game.nameVi ILIKE :search)', { search: `%${search}%` });
      }

      // Add ordering for consistent results
      qb.orderBy('game.isHot', 'DESC')
        .addOrderBy('game.isNew', 'DESC')
        .addOrderBy('game.nameEn', 'ASC');

      const [items, total] = await qb
        .skip(skip)
        .take(limit)
        .getManyAndCount();

      return {
        items,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    }, 10 * 60 * 1000); // 10 minutes cache
  }

  @Cache({ ttl: 30 * 60 * 1000 }) // Cache for 30 minutes
  async getPopularGames(limit: number = 10) {
    const cacheKey = `games:popular:${limit}`;
    
    return this.cacheService.getOrSet(cacheKey, async () => {
      return this.gameRepository.find({
        where: { isHot: true },
        order: { nameEn: 'ASC' },
        take: limit,
      });
    }, 30 * 60 * 1000);
  }

  @Cache({ ttl: 30 * 60 * 1000 }) // Cache for 30 minutes
  async getNewGames(limit: number = 10) {
    const cacheKey = `games:new:${limit}`;
    
    return this.cacheService.getOrSet(cacheKey, async () => {
      return this.gameRepository.find({
        where: { isHot: true },
        order: { nameEn: 'ASC' },
        take: limit,
      });
    }, 30 * 60 * 1000);
  }

  @Cache({ ttl: 60 * 60 * 1000 }) // Cache for 1 hour
  async getGamesByProvider(providerCode: string) {
    const cacheKey = `games:provider:${providerCode}`;
    
    return this.cacheService.getOrSet(cacheKey, async () => {
      return this.gameRepository.find({
        where: { providerCode },
        order: { nameEn: 'ASC' },
      });
    }, 60 * 60 * 1000);
  }

  async findOne(id: string) {
    const game = await this.gameRepository.findOne({ where: { id } });
    if (!game) {
      throw new NotFoundException(`Game not found`);
    }
    return game;
  }

  async launch(userId: string, launchDto: LaunchGameDto) {
    const game = await this.findOne(launchDto.gameId);
    
    // MOCK: Generate a fake play URL
    // In a real system, checking provider and requesting a session key would happen here
    const playUrl = `https://pg88.com/play/${game.id}?token=mock-token-${userId}`;
    
    return {
      url: playUrl,
      gameId: game.id,
      gameName: game.nameEn,
    };
  }

  async handleCallback(callbackDto: ProviderCallbackDto) {
    const { userId, type, amount, referenceId, gameId } = callbackDto;

    // Use TransactionsService to handle balance update
    // We assume TransactionsService can handle generic transactions or we'll need to add a method
    return this.transactionsService.processGameTransaction(userId, amount, type, referenceId);
  }
}
