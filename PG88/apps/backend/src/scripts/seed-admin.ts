import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole, UserStatus } from '../users/entities/user.entity';
import { RegisterDto } from '../auth/dto/register.dto';
import * as argon2 from 'argon2';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const usersRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const adminUsername = 'admin';
  const adminPassword = 'adminPassword123'; // SHOULD BE CHANGED IN PRODUCTION

  const existingAdmin = await usersRepository.findOne({ where: { username: adminUsername } });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    if (existingAdmin.role !== UserRole.ADMIN) {
        existingAdmin.role = UserRole.ADMIN;
        await usersRepository.save(existingAdmin);
        console.log('Updated existing user to ADMIN role.');
    }
  } else {
    console.log('Creating Admin user...');
    // Create new admin
    // We can't use AuthService.register because it doesn't set ROLE. 
    // Manual creation via Repository.
    
    // Generate simple salt/hash
    const passwordHash = await argon2.hash(adminPassword);
    const referralCode = 'ADMIN01';

    const newAdmin = usersRepository.create({
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

    await usersRepository.save(newAdmin);
    console.log(`Admin user created: ${adminUsername} / ${adminPassword}`);
  }

  await app.close();
}

bootstrap();
