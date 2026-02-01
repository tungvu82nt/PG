import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AgencyController } from './agency.controller';
import { AgencyService } from './agency.service';
import { CommissionRecord } from './entities/commission-record.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommissionRecord]),
    UsersModule
  ],
  controllers: [AgencyController],
  providers: [AgencyService],
  exports: [AgencyService]
})
export class AgencyModule {}
