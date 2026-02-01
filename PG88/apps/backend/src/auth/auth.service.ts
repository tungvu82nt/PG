import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';
import * as argon2 from 'argon2';
import * as crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  async register(registerDto: RegisterDto): Promise<any> {
    const { username, password, realName, phone, affiliateId } = registerDto;

    // Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: [{ username }, { phone: phone || '' }],
    });

    if (existingUser) {
      throw new ConflictException('Username or Phone already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Generate Referral Code (Simple 6 chars alphanumeric)
    const referralCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const newUser = this.usersRepository.create({
      username,
      passwordHash,
      salt: uuidv4(),
      realName: realName ? realName.toUpperCase() : null,
      phone,
      referralCode,
      referrerId: affiliateId || null,
      status: UserStatus.ACTIVE,
    } as unknown as DeepPartial<User>);

    try {
      await this.usersRepository.save(newUser);
    } catch (error) {
       // Handle duplicate unique constraints if any race condition
       throw new ConflictException('User registration failed');
    }

    const { passwordHash: p, salt: s, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { username, password } = loginDto;
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is locked or banned');
    }

    const payload = { username: user.username, sub: user.id, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        balance: user.balance,
        role: user.role,
      }
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    const { email } = forgotPasswordDto;
    // Assuming we find user by email. If field is nullable, might be tricky.
    // Our entity has email field.
    const user = await this.usersRepository.findOne({ where: { email } });

    // Try finding by username if email logic matches username? No, DTO says email.
    // Plan: if config allows scanning email in register, we rely on it.
    
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    const token = crypto.randomBytes(20).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 hour expiration

    await this.usersService.setResetToken(user.id, token, expires);

    // MOCK EMAIL SENDING
    console.log(`[MOCK EMAIL] Password reset token for ${email}: ${token}`);
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    const { token, newPassword } = resetPasswordDto;
    const user = await this.usersService.findByResetToken(token);

    if (!user) {
      throw new BadRequestException('Invalid or expired token');
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
       throw new BadRequestException('Invalid or expired token');
    }

    user.passwordHash = await argon2.hash(newPassword);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.usersRepository.save(user);
  }

  async getUserProfile(userId: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, salt, ...result } = user;
    return result as User;
  }
  
  async logout(userId: string): Promise<void> {
    // In JWT stateless, logout is client-side.
    // Ideally we blacklist token or shorten expiry, but simply returning OK is standard for basic JWT.
    // If we have Redis, we could blacklist.
    return;
  }
}
