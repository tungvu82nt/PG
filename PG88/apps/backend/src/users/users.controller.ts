import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get current user profile' })
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.userId);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update user profile' })
  updateProfile(@Request() req: any, @Body() updateProfileDto: UpdateProfileDto) {
    return this.usersService.updateProfile(req.user.userId, updateProfileDto);
  }

  @Patch('change-password')
  @ApiOperation({ summary: 'Change user password' })
  changePassword(@Request() req: any, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(req.user.userId, changePasswordDto);
  }

  @Get('bank-accounts')
  @ApiOperation({ summary: 'Get user bank accounts' })
  getBankAccounts(@Request() req: any) {
    return this.usersService.getBankAccounts(req.user.userId);
  }

  @Post('bank-accounts')
  @ApiOperation({ summary: 'Add a new bank account' })
  addBankAccount(@Request() req: any, @Body() createBankAccountDto: CreateBankAccountDto) {
    return this.usersService.addBankAccount(req.user.userId, createBankAccountDto);
  }

  @Delete('bank-accounts/:id')
  @ApiOperation({ summary: 'Remove (soft delete) a bank account' })
  removeBankAccount(@Request() req: any, @Param('id') id: string) {
    return this.usersService.removeBankAccount(req.user.userId, id);
  }
}
