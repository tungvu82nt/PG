import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TransactionsService } from './transactions.service';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { TransactionHistoryQueryDto } from './dto/transaction-history.query.dto';

@ApiTags('Transactions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  @ApiOperation({ summary: 'Deposit money (Mock)' })
  deposit(@Request() req: any, @Body() createDepositDto: CreateDepositDto) {
    return this.transactionsService.deposit(req.user.userId, createDepositDto);
  }

  @Post('withdraw')
  @ApiOperation({ summary: 'Request withdrawal' })
  withdraw(@Request() req: any, @Body() createWithdrawalDto: CreateWithdrawalDto) {
    return this.transactionsService.withdraw(req.user.userId, createWithdrawalDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get transaction history' })
  getHistory(@Request() req: any, @Query() query: TransactionHistoryQueryDto) {
    return this.transactionsService.getHistory(req.user.userId, query);
  }

  @Get('balance')
  @ApiOperation({ summary: 'Get current user balance' })
  getBalance(@Request() req: any) {
    return this.transactionsService.getBalance(req.user.userId);
  }
}
