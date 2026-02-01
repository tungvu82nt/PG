import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction, TransactionStatus, TransactionType } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { BankAccount } from '../users/entities/bank-account.entity';
import { CreateDepositDto } from './dto/create-deposit.dto';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import { TransactionHistoryQueryDto } from './dto/transaction-history.query.dto';
import { AppGateway } from '../gateway/app.gateway';

@Injectable()
export class TransactionsService {
  private readonly logger = new Logger(TransactionsService.name);

  constructor(
    @InjectRepository(Transaction)
    private transactionsRepository: Repository<Transaction>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private dataSource: DataSource,
    private readonly gateway: AppGateway,
  ) {}

  async deposit(userId: string, createDepositDto: CreateDepositDto) {
    const { amount } = createDepositDto;
    
    // Start a database transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Get User (with lock to prevent race conditions potentially, though basic for now)
      // Using pessimistic_write lock to ensure balance consistency
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // 2. Update Balance
      // Ensure balance is treated as number
      user.balance = Number(user.balance) + Number(amount);
      await queryRunner.manager.save(user);

      // 3. Create Transaction Record
      const transaction = queryRunner.manager.create(Transaction, {
        userId: user.id,
        amount: amount,
        type: TransactionType.DEPOSIT,
        status: TransactionStatus.SUCCESS, // Auto-approve for mock
        auditId: `DEP-${Date.now()}`, // Simple mock audit ID
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      // Commit
      await queryRunner.commitTransaction();

      this.logger.log(`User ${userId} deposited ${amount}. New Balance: ${user.balance}`);

      return {
        message: 'Deposit successful',
        newBalance: user.balance,
        transaction: savedTransaction,
      };

    } catch (err) {
      this.logger.error(`Deposit failed for user ${userId}: ${err.message}`);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async withdraw(userId: string, createWithdrawalDto: CreateWithdrawalDto) {
    const { amount, bankAccountId } = createWithdrawalDto;
    
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      if (Number(user.balance) < Number(amount)) {
        throw new BadRequestException('Insufficient funds');
      }

      // Check Bank Account
      const bankAccount = await queryRunner.manager.findOne(BankAccount, {
        where: { id: bankAccountId, user: { id: userId } }
      });

      if (!bankAccount) {
        throw new BadRequestException('Bank account not found');
      }

      // 2. Deduct Balance
      user.balance = Number(user.balance) - Number(amount);
      await queryRunner.manager.save(user);

      // 3. Create Transaction Record
      const transaction = queryRunner.manager.create(Transaction, {
        userId: user.id,
        amount: amount,
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING, // Withdrawals usually pending approval
        auditId: `WTH-${Date.now()}|BANK:${bankAccount.bankName}|ACC:${bankAccount.accountNumber}|NAME:${bankAccount.accountName}`,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(`User ${userId} withdrew ${amount}. New Balance: ${user.balance}`);

      return {
        message: 'Withdrawal request submitted',
        newBalance: user.balance,
        transaction: savedTransaction,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getHistory(userId: string, query: TransactionHistoryQueryDto) {
    const { type, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionsRepository.createQueryBuilder('transaction');
    queryBuilder.where('transaction.user_id = :userId', { userId });

    if (type) {
        queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
        queryBuilder.andWhere('transaction.status = :status', { status });
    }

    queryBuilder.orderBy('transaction.created_at', 'DESC');
    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

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

  async getBalance(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');
    return { balance: Number(user.balance), currency: user.currency };
  }
  async processGameTransaction(userId: string, amount: number, type: TransactionType, referenceId: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Handle Balance Update
      if (type === TransactionType.BET) {
        if (Number(user.balance) < Number(amount)) {
            throw new BadRequestException('Insufficient balance for bet');
        }
        user.balance = Number(user.balance) - Number(amount);
      } else if (type === TransactionType.WIN) {
        user.balance = Number(user.balance) + Number(amount);
      }

      await queryRunner.manager.save(user);

      // Create Transaction Record
      const transaction = queryRunner.manager.create(Transaction, {
        userId: user.id,
        amount: amount,
        type: type,
        status: TransactionStatus.SUCCESS, 
        auditId: referenceId || `GAME-${Date.now()}`,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Game Transaction: User ${userId} ${type} ${amount}. New Balance: ${user.balance}`);

      // Emit balance update
      this.gateway.emitBalanceUpdate(userId, user.balance);

      return {
        success: true,
        newBalance: user.balance,
        transactionId: savedTransaction.id,
      };

    } catch (err) {
      this.logger.error(`Game Transaction failed: ${err.message}`);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async adminAdjustBalance(userId: string, amount: number, type: 'DEPOSIT' | 'WITHDRAW', reason: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Handle Balance Update
      if (type === 'WITHDRAW') {
        if (Number(user.balance) < Number(amount)) {
            throw new BadRequestException('Insufficient balance for deduction');
        }
        user.balance = Number(user.balance) - Number(amount);
      } else {
        user.balance = Number(user.balance) + Number(amount);
      }

      await queryRunner.manager.save(user);

      // Create Transaction Record
      const transaction = queryRunner.manager.create(Transaction, {
        userId: user.id,
        amount: amount,
        type: TransactionType.ADJUSTMENT,
        status: TransactionStatus.SUCCESS, 
        auditId: `ADMIN-${Date.now()}-${reason || 'manual'}`,
      });
      const savedTransaction = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.logger.log(`Admin Adjustment: User ${userId} ${type} ${amount}. New Balance: ${user.balance}`);

      // Emit balance update
      this.gateway.emitBalanceUpdate(userId, user.balance);

      return {
        success: true,
        newBalance: user.balance,
        transaction: savedTransaction,
      };

    } catch (err) {
      this.logger.error(`Admin Adjustment failed: ${err.message}`);
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
  async getPendingWithdrawals(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await this.transactionsRepository.findAndCount({
        where: { 
            type: TransactionType.WITHDRAW, 
            status: TransactionStatus.PENDING 
        },
        order: { createdAt: 'ASC' },
        skip,
        take: limit,
        relations: ['user'] // Assuming Transaction has ManyToOne to User? Need to check relation.
    });
    
    // Ensure User relation in Transaction entity if not exists!
    // For now assuming relation exists or fetching manually if not. 
    // Checking Entity: Property 'user' does not exist on type 'Transaction'. 
    // Wait, let's fix Entity first if needed, but 'userId' column exists.
    
    return {
        items,
        meta: {
            totalItems: total,
            itemCount: items.length,
            itemsPerPage: Number(limit),
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page),
        }
    };
  }

  async reviewWithdrawal(id: string, action: 'APPROVE' | 'REJECT', reason?: string) {
      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
          // Lock transaction row?
          const transaction = await queryRunner.manager.findOne(Transaction, {
              where: { id },
              lock: { mode: 'pessimistic_write' }
          });

          if (!transaction) throw new BadRequestException('Transaction not found');
          if (transaction.status !== TransactionStatus.PENDING) {
              throw new BadRequestException('Transaction is not pending');
          }
          if (transaction.type !== TransactionType.WITHDRAW) {
              throw new BadRequestException('Not a withdrawal transaction');
          }

          if (action === 'APPROVE') {
              transaction.status = TransactionStatus.SUCCESS;
              transaction.auditId = transaction.auditId + (reason ? `|APPROVED:${reason}` : '|APPROVED');
              await queryRunner.manager.save(transaction);
          } else {
              // REJECT: Refund money
              transaction.status = TransactionStatus.REJECTED;
              transaction.auditId = transaction.auditId + (reason ? `|REJECTED:${reason}` : '|REJECTED');
              await queryRunner.manager.save(transaction);

              // Refund User
              const user = await queryRunner.manager.findOne(User, {
                  where: { id: transaction.userId },
                  lock: { mode: 'pessimistic_write' }
              });
              
              if (user) {
                  user.balance = Number(user.balance) + Number(transaction.amount);
                  await queryRunner.manager.save(user);
                  this.gateway.emitBalanceUpdate(user.id, user.balance);
              }
          }

          await queryRunner.commitTransaction();
          return { success: true, transaction };

      } catch (err) {
          await queryRunner.rollbackTransaction();
          throw err;
      } finally {
          await queryRunner.release();
      }
  }
  async findAllAdmin(query: any) {
    const { username, type, status, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.transactionsRepository.createQueryBuilder('transaction')
        .leftJoinAndSelect('transaction.user', 'user')
        .orderBy('transaction.createdAt', 'DESC');

    if (username) {
        queryBuilder.andWhere('user.username ILIKE :username', { username: `%${username}%` });
    }

    if (type) {
        queryBuilder.andWhere('transaction.type = :type', { type });
    }

    if (status) {
        queryBuilder.andWhere('transaction.status = :status', { status });
    }

    queryBuilder.skip(skip).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

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

  async getAdminStats() {
    const totalDeposits = await this.transactionsRepository
      .createQueryBuilder('t')
      .where('t.type = :type', { type: TransactionType.DEPOSIT })
      .andWhere('t.status = :status', { status: TransactionStatus.SUCCESS })
      .select('SUM(t.amount)', 'sum')
      .getRawOne();

    const totalWithdrawals = await this.transactionsRepository
      .createQueryBuilder('t')
      .where('t.type = :type', { type: TransactionType.WITHDRAW })
      .andWhere('t.status = :status', { status: TransactionStatus.SUCCESS })
      .select('SUM(t.amount)', 'sum')
      .getRawOne();

    const pendingWithdrawals = await this.transactionsRepository.count({
      where: {
        type: TransactionType.WITHDRAW,
        status: TransactionStatus.PENDING,
      },
    });

    return {
      totalDeposit: Number(totalDeposits?.sum || 0),
      totalWithdraw: Number(totalWithdrawals?.sum || 0),
      pendingWithdrawals,
    };
  }
}
