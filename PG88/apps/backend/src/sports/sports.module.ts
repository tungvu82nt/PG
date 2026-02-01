import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SportsController } from './sports.controller';
import { SportsService } from './sports.service';
import { Sport } from './entities/sport.entity';
import { League } from './entities/league.entity';
import { Match } from './entities/match.entity';
import { Odds } from './entities/odds.entity';
import { Bet } from './entities/bet.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sport,
      League,
      Match,
      Odds,
      Bet,
      User
    ])
  ],
  controllers: [SportsController],
  providers: [SportsService],
  exports: [SportsService]
})
export class SportsModule {}