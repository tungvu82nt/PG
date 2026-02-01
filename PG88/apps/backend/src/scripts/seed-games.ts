import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import { Game, GameCategory } from '../games/entities/game.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as fs from 'fs';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const gamesRepository = app.get<Repository<Game>>(getRepositoryToken(Game));

  // Path to the JSON file
  const jsonPath = path.resolve('d:/Tool/WEB/LOVABLE/Y1/Y3/processed_data/game_list_full.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`);
    await app.close();
    return;
  }

  console.log('Reading game data...');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const jsonData = JSON.parse(rawData);
  
  const games = jsonData.gameWithTags?.data || [];
  console.log(`Found ${games.length} games to process.`);

  let count = 0;
  for (const item of games) {
    // Map category
    let category: GameCategory = GameCategory.SLOT;
    const typeId = (item.producttypeid || '').toUpperCase();
    
    if (typeId === 'EGAME' || typeId === 'SLOT') category = GameCategory.SLOT;
    else if (typeId === 'LIVE' || typeId === 'CASINO') category = GameCategory.LIVE;
    else if (typeId === 'FISH' || typeId === 'FISHING') category = GameCategory.FISH;
    else if (typeId === 'SPORT' || typeId === 'SPORTS' || typeId === 'ANIMAL') category = GameCategory.SPORTS;
    else if (typeId === 'LOTTERY') category = GameCategory.LOTTERY;
    else if (typeId === 'BOARD' || typeId === 'CHESS') category = GameCategory.CARD;

    // Check if exists
    const existing = await gamesRepository.findOne({ 
        where: { 
            providerCode: item.gameproviderid,
            gameCode: item.gameid 
        } 
    });

    if (!existing) {
        const newGame = gamesRepository.create({
            providerCode: item.gameproviderid,
            gameCode: item.gameid,
            nameVi: item.gamename?.['vi-VN'] || item.gamename?.['en-US'] || item.gameid,
            nameEn: item.gamename?.['en-US'] || item.gameid,
            imageUrl: item.icon_url || '', // Adjust if field name differs
            category,
            status: true,
            isHot: Math.random() < 0.1, // Randomly mark 10% as hot
            maxBet: 1000000,
            minBet: 1000,
        });
        
        await gamesRepository.save(newGame);
        count++;
        if (count % 100 === 0) console.log(`Seeded ${count} games...`);
    }
  }

  console.log(`Seeding complete. Added ${count} new games.`);
  await app.close();
}

bootstrap();
