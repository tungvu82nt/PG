import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommissionRecord, CommissionStatus } from './entities/commission-record.entity';
import { User } from '../users/entities/user.entity';
import { AgencyStatsDto } from './dto/agency-stats.dto';
import { MemberListQueryDto } from './dto/member-list.query.dto';

@Injectable()
export class AgencyService {
  constructor(
    @InjectRepository(CommissionRecord)
    private commissionRepository: Repository<CommissionRecord>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async getDashboardStats(userId: string): Promise<AgencyStatsDto> {
    // 1. Count Direct Members
    const totalMembers = await this.usersRepository.count({
      where: { referrerId: userId },
    });

    // 2. Calculate Today's Commission (Estimated)
    // TODO: Connect to actual Transaction/Bets table when ready
    // For now, return 0 or mock
    const todayCommission = 0; 

    // 3. Calculate Total Commission Paid/Pending
    const totalCommissionResult = await this.commissionRepository
      .createQueryBuilder('commission')
      .select('SUM(commission.amount)', 'total')
      .where('commission.agentId = :userId', { userId })
      .getRawOne();

    const totalCommission = parseFloat(totalCommissionResult.total) || 0;

    return {
      totalMembers,
      todayCommission,
      totalCommission,
    };
  }

  async getMembers(userId: string, query: MemberListQueryDto) {
    const { page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const [members, total] = await this.usersRepository.findAndCount({
      where: { referrerId: userId },
      select: ['id', 'username', 'realName', 'createdAt'], 
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });
    
    // Map to safe response properties
    const mappedMembers = members.map(m => ({
        id: m.id,
        username: m.username,
        registerDate: m.createdAt,
        totalBet: 0 // Placeholder
    }));

    return {
      data: mappedMembers,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
      },
    };
  }
}
