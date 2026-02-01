import { DataSource } from 'typeorm';
import { Sport } from '../entities/sport.entity';
import { League } from '../entities/league.entity';
import { Match, MatchStatus } from '../entities/match.entity';
import { Odds, BetType } from '../entities/odds.entity';

export async function seedSportsData(dataSource: DataSource) {
  const sportRepository = dataSource.getRepository(Sport);
  const leagueRepository = dataSource.getRepository(League);
  const matchRepository = dataSource.getRepository(Match);
  const oddsRepository = dataSource.getRepository(Odds);

  // Check if data already exists
  const existingSports = await sportRepository.count();
  if (existingSports > 0) {
    console.log('Sports data already exists, skipping seed...');
    return;
  }

  console.log('Seeding sports data...');

  // Create Sports
  const football = await sportRepository.save({
    name: 'football',
    displayName: 'Bóng Đá',
    icon: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-sbobet.png',
    isActive: true,
    sortOrder: 1
  });

  const basketball = await sportRepository.save({
    name: 'basketball',
    displayName: 'Bóng Rổ',
    icon: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-saba.png',
    isActive: true,
    sortOrder: 2
  });

  const tennis = await sportRepository.save({
    name: 'tennis',
    displayName: 'Quần Vợt',
    icon: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-pinnacle.png',
    isActive: true,
    sortOrder: 3
  });

  // Create Leagues
  const premierLeague = await leagueRepository.save({
    name: 'premier_league',
    displayName: 'Premier League',
    country: 'England',
    logo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-sbobet.png',
    isActive: true,
    sortOrder: 1,
    sportId: football.id
  });

  const laLiga = await leagueRepository.save({
    name: 'la_liga',
    displayName: 'La Liga',
    country: 'Spain',
    logo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-saba.png',
    isActive: true,
    sortOrder: 2,
    sportId: football.id
  });

  const nba = await leagueRepository.save({
    name: 'nba',
    displayName: 'NBA',
    country: 'USA',
    logo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-pinnacle.png',
    isActive: true,
    sortOrder: 1,
    sportId: basketball.id
  });

  // Create Matches
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  // Live match
  const liveMatch = await matchRepository.save({
    homeTeam: 'Manchester United',
    awayTeam: 'Liverpool',
    homeTeamLogo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-sbobet.png',
    awayTeamLogo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-saba.png',
    startTime: new Date(now.getTime() - 30 * 60 * 1000), // Started 30 minutes ago
    status: MatchStatus.LIVE,
    homeScore: 1,
    awayScore: 0,
    minute: 67,
    isLive: true,
    isBettingActive: true,
    leagueId: premierLeague.id
  });

  // Upcoming matches
  const upcomingMatch1 = await matchRepository.save({
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    homeTeamLogo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-pinnacle.png',
    awayTeamLogo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-sbobet.png',
    startTime: tomorrow,
    status: MatchStatus.SCHEDULED,
    isLive: false,
    isBettingActive: true,
    leagueId: laLiga.id
  });

  const upcomingMatch2 = await matchRepository.save({
    homeTeam: 'Lakers',
    awayTeam: 'Warriors',
    homeTeamLogo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-saba.png',
    awayTeamLogo: 'https://img.ihudba.com/img/static/desktop/sub-menu/sub-sports-pinnacle.png',
    startTime: nextWeek,
    status: MatchStatus.SCHEDULED,
    isLive: false,
    isBettingActive: true,
    leagueId: nba.id
  });

  // Create Odds for live match
  await oddsRepository.save([
    {
      betType: BetType.MATCH_WINNER,
      market: '1X2',
      selection: 'Home',
      odds: 2.10,
      isActive: true,
      matchId: liveMatch.id
    },
    {
      betType: BetType.MATCH_WINNER,
      market: '1X2',
      selection: 'Draw',
      odds: 3.40,
      isActive: true,
      matchId: liveMatch.id
    },
    {
      betType: BetType.MATCH_WINNER,
      market: '1X2',
      selection: 'Away',
      odds: 3.20,
      isActive: true,
      matchId: liveMatch.id
    },
    {
      betType: BetType.OVER_UNDER,
      market: 'Over/Under 2.5',
      selection: 'Over',
      odds: 1.85,
      isActive: true,
      total: 2.5,
      matchId: liveMatch.id
    },
    {
      betType: BetType.OVER_UNDER,
      market: 'Over/Under 2.5',
      selection: 'Under',
      odds: 1.95,
      isActive: true,
      total: 2.5,
      matchId: liveMatch.id
    }
  ]);

  // Create Odds for upcoming match 1
  await oddsRepository.save([
    {
      betType: BetType.MATCH_WINNER,
      market: '1X2',
      selection: 'Home',
      odds: 2.50,
      isActive: true,
      matchId: upcomingMatch1.id
    },
    {
      betType: BetType.MATCH_WINNER,
      market: '1X2',
      selection: 'Draw',
      odds: 3.10,
      isActive: true,
      matchId: upcomingMatch1.id
    },
    {
      betType: BetType.MATCH_WINNER,
      market: '1X2',
      selection: 'Away',
      odds: 2.80,
      isActive: true,
      matchId: upcomingMatch1.id
    }
  ]);

  // Create Odds for upcoming match 2
  await oddsRepository.save([
    {
      betType: BetType.MATCH_WINNER,
      market: 'Money Line',
      selection: 'Home',
      odds: 1.90,
      isActive: true,
      matchId: upcomingMatch2.id
    },
    {
      betType: BetType.MATCH_WINNER,
      market: 'Money Line',
      selection: 'Away',
      odds: 1.90,
      isActive: true,
      matchId: upcomingMatch2.id
    },
    {
      betType: BetType.OVER_UNDER,
      market: 'Total Points 220.5',
      selection: 'Over',
      odds: 1.95,
      isActive: true,
      total: 220.5,
      matchId: upcomingMatch2.id
    },
    {
      betType: BetType.OVER_UNDER,
      market: 'Total Points 220.5',
      selection: 'Under',
      odds: 1.85,
      isActive: true,
      total: 220.5,
      matchId: upcomingMatch2.id
    }
  ]);

  console.log('Sports data seeded successfully!');
}