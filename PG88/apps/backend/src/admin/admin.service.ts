import { Injectable, OnModuleInit, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as argon2 from 'argon2';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import { AdminUserQueryDto } from './dto/admin-user-query.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { AdjustBalanceDto, AdjustmentType } from './dto/adjust-balance.dto';
import { ReviewWithdrawalDto } from './dto/review-withdrawal.dto';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class AdminService implements OnModuleInit {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private transactionsService: TransactionsService,
  ) {}

  async onModuleInit() {
    await this.seedAdminUser();
  }

  private async seedAdminUser() {
    const adminUsername = 'admin';
    const adminPassword = 'adminPassword123'; // Change in production!

    const existingAdmin = await this.usersRepository.findOne({ where: { username: adminUsername } });

    if (existingAdmin) {
      if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await this.usersRepository.save(existingAdmin);
        this.logger.log('Updated existing "admin" user to ADMIN role.');
      }
      return;
    }

    const passwordHash = await argon2.hash(adminPassword);
    const referralCode = 'ADMIN01';

    const newAdmin = this.usersRepository.create({
      username: adminUsername,
      passwordHash,
      salt: 'admin-salt',
      realName: 'SUPER ADMIN',
      phone: '0000000000',
      referralCode,
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      currency: 'VND',
      balance: 0,
    });

    try {
        await this.usersRepository.save(newAdmin);
        this.logger.log(`Admin user created: ${adminUsername}`);
    } catch (e) {
        this.logger.error('Failed to create admin user', e);
    }
  }

  // Admin Features Implementation

  async findAllUsers(query: AdminUserQueryDto) {
    const { search, status, role, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    if (search) {
      queryBuilder.andWhere(
        '(user.username ILIKE :search OR user.email ILIKE :search OR user.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (status) {
      queryBuilder.andWhere('user.status = :status', { status });
    }

    if (role) {
      queryBuilder.andWhere('user.role = :role', { role });
    }

    if (query.referrerId) {
      queryBuilder.andWhere('user.referrerId = :referrerId', { referrerId: query.referrerId });
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    // Remove sensitive data
    const safeItems = items.map((user) => {
      const { passwordHash, salt, ...result } = user;
      return result;
    });

    return {
      items: safeItems,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
  }

  async findOneUser(id: string) {
    const user = await this.usersRepository.findOne({ 
      where: { id },
      relations: ['bankAccounts', 'commissionRecords'] 
    });
    if (!user) throw new NotFoundException('User not found');
      
    const { passwordHash, salt, ...result } = user;
    return result;
  }

  async updateUserStatus(id: string, dto: UpdateUserStatusDto) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.status = dto.status;
    // Log reason if needed mechanism exists
    return this.usersRepository.save(user);
  }

  async adjustBalance(id: string, dto: AdjustBalanceDto) {
      const { type, amount, reason } = dto;
      
      const adjustmentType = type === AdjustmentType.DEPOSIT ? 'DEPOSIT' : 'WITHDRAW';
      
      return this.transactionsService.adminAdjustBalance(id, amount, adjustmentType, reason || 'Admin Manual Adjustment');
  }

  async getTransactions(query: any) {
    return this.transactionsService.findAllAdmin(query);
  }

  async getPendingWithdrawals(page: number, limit: number) {
      return this.transactionsService.getPendingWithdrawals(page, limit);
  }

  async reviewWithdrawal(id: string, dto: ReviewWithdrawalDto) {
    return this.transactionsService.reviewWithdrawal(
      id,
      dto.action,
      dto.reason,
    );
  }

  async getAgencyList(page: number = 1, limit: number = 10, search?: string) {
    const skip = (page - 1) * limit;
      
    const qb = this.usersRepository
      .createQueryBuilder('user')
      .loadRelationCountAndMap('user.memberCount', 'user.members')
      .orderBy('user.createdAt', 'DESC');

    if (search) {
      qb.andWhere(
        '(user.username ILIKE :search OR user.phone ILIKE :search OR user.email ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [users, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    // Transform response to include memberCount
    const items = users.map((user) => {
      const { passwordHash, salt, ...safeUser } = user;
      return {
        ...safeUser,
        memberCount: (user as any).memberCount || 0,
      };
    });

    return {
      items,
      meta: {
        totalItems: total,
        itemCount: items.length,
        itemsPerPage: Number(limit),
        totalPages: Math.ceil(total / limit),
        currentPage: Number(page),
      },
    };
  }

  async getStats() {
    const totalUsers = await this.usersRepository.count();
    const transactionStats = await this.transactionsService.getAdminStats();

    return {
      totalUsers,
      ...transactionStats,
    };
  }
}

