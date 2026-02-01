import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdjustBalanceDto } from './dto/adjust-balance.dto';
import { ReviewWithdrawalDto } from './dto/review-withdrawal.dto';
import { AdminTransactionQueryDto } from './dto/admin-transaction-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'List all users' })
  findAllUsers(@Query() query: AdminUserQueryDto) {
    return this.adminService.findAllUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  findOneUser(@Param('id') id: string) {
    return this.adminService.findOneUser(id);
  }

  @Patch('users/:id/status')
  @ApiOperation({ summary: 'Update user status (Lock/Unlock)' })
  updateUserStatus(
      @Param('id') id: string,
      @Body() dto: UpdateUserStatusDto
  ) {
      return this.adminService.updateUserStatus(id, dto);
  }

  @Post('users/:id/adjust-balance')
  @ApiOperation({ summary: 'Adjust user balance (Deposit/Withdraw)' })
  adjustBalance(
      @Param('id') id: string,
      @Body() dto: AdjustBalanceDto
  ) {
      return this.adminService.adjustBalance(id, dto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  getStats() {
      return this.adminService.getStats();
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List all transactions with filters' })
  getTransactions(@Query() query: AdminTransactionQueryDto) {
      return this.adminService.getTransactions(query);
  }

  @Get('transactions/withdrawals/pending')
  @ApiOperation({ summary: 'List pending withdrawals' })
  getPendingWithdrawals(@Query('page') page: number, @Query('limit') limit: number) {
      return this.adminService.getPendingWithdrawals(page, limit);
  }

  @Get('agencies')
  @ApiOperation({ summary: 'List agencies (Users with member stats)' })
  getAgencies(
    @Query('page') page: number, 
    @Query('limit') limit: number,
    @Query('search') search?: string,
  ) {
    return this.adminService.getAgencyList(page, limit, search);
  }

  @Post('transactions/withdrawals/:id/review')
  @ApiOperation({ summary: 'Review withdrawal (Approve/Reject)' })
  reviewWithdrawal(
      @Param('id') id: string,
      @Body() dto: ReviewWithdrawalDto
  ) {
      return this.adminService.reviewWithdrawal(id, dto);
  }
}

