import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { BankAccount, BankAccountStatus } from './entities/bank-account.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import * as argon2 from 'argon2';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(BankAccount)
    private bankAccountRepository: Repository<BankAccount>,
  ) {}

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }


  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<User> {
    const user = await this.findOne(userId);

    if (updateProfileDto.realName)
      user.realName = updateProfileDto.realName.toUpperCase();
    if (updateProfileDto.birthday)
      user.birthday = new Date(updateProfileDto.birthday);
    if (updateProfileDto.phone) user.phone = updateProfileDto.phone;
    if (updateProfileDto.email) user.email = updateProfileDto.email;

    return this.usersRepository.save(user);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.findOne(userId);
    const { oldPassword, newPassword } = changePasswordDto;

    const isPasswordValid = await argon2.verify(user.passwordHash, oldPassword);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect old password');
    }

    user.passwordHash = await argon2.hash(newPassword);
    await this.usersRepository.save(user);
  }

  async addBankAccount(
    userId: string,
    createBankAccountDto: CreateBankAccountDto,
  ): Promise<BankAccount> {
    const user = await this.findOne(userId);

    const bankAccount = this.bankAccountRepository.create({
      ...createBankAccountDto,
      user,
    });

    return this.bankAccountRepository.save(bankAccount);
  }

  async getBankAccounts(userId: string): Promise<BankAccount[]> {
    return this.bankAccountRepository.find({
      where: {
        user: { id: userId },
        status: BankAccountStatus.ACTIVE,
      },
      order: { createdAt: 'DESC' },
    });
  }

  async removeBankAccount(userId: string, bankAccountId: string): Promise<void> {
    const bankAccount = await this.bankAccountRepository.findOne({
      where: { id: bankAccountId, user: { id: userId } },
    });

    if (!bankAccount) {
      throw new NotFoundException('Bank account not found');
    }

    bankAccount.status = BankAccountStatus.INACTIVE;
    await this.bankAccountRepository.save(bankAccount);
  }

  async setResetToken(
    userId: string,
    token: string,
    expires: Date,
  ): Promise<void> {
    await this.usersRepository.update(userId, {
      resetPasswordToken: token,
      resetPasswordExpires: expires,
    });
  }

  async findByResetToken(token: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }
}
