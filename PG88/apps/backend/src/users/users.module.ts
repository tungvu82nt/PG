import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { BankAccount } from './entities/bank-account.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, BankAccount])],
  controllers: [UsersController],
  providers: [UsersService],

  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
