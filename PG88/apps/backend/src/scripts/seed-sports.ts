import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { seedSportsData } from '../sports/seeds/sports.seed';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('Starting sports data seeding...');
    await seedSportsData(dataSource);
    console.log('Sports data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding sports data:', error);
  } finally {
    await app.close();
  }
}

bootstrap();