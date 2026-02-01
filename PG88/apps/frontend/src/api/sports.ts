import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

export interface Sport {
  id: string;
  name: string;
  displayName: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  leagues: League[];
  createdAt: string;
  updatedAt: string;
}

export interface League {
  id: string;
  name: string;
  displayName: string;
  country: string;
  logo?: string;
  isActive: boolean;
  sortOrder: number;
  sportId: string;
  sport: Sport;
  matches: Match[];
  createdAt: string;
  updatedAt: string;
}

export interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamLogo?: string;
  awayTeamLogo?: string;
  startTime: string;
  status: 'scheduled' | 'live' | 'finished' | 'cancelled' | 'postponed';
  homeScore?: number;
  awayScore?: number;
  minute?: number;
  isLive: boolean;
  isBettingActive: boolean;
  leagueId: string;
  league: League;
  odds: Odds[];
  createdAt: string;
  updatedAt: string;
}

export interface Odds {
  id: string;
  betType: 'match_winner' | 'over_under' | 'handicap' | 'both_teams_score' | 'correct_score' | 'first_goal' | 'total_goals';
  market: string;
  selection: string;
  odds: number;
  isActive: boolean;
  handicap?: number;
  total?: number;
  matchId: string;
  match: Match;
  createdAt: string;
  updatedAt: string;
}

export interface Bet {
  id: string;
  amount: number;
  odds: number;
  potentialWin: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled' | 'refunded';
  selection: string;
  market: string;
  result?: string;
  userId: string;
  matchId: string;
  oddsId: string;
  match: Match;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBetRequest {
  matchId: string;
  oddsId: string;
  amount: number;
  selection: string;
  market: string;
  odds: number;
}

export interface GetMatchesRequest {
  sportId?: string;
  leagueId?: string;
  status?: string;
  isLive?: boolean;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class SportsAPI {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async getSports(): Promise<Sport[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/sports`);
    return response.data;
  }

  async getLeaguesBySport(sportId: string): Promise<League[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/sports/${sportId}/leagues`);
    return response.data;
  }

  async getMatches(params: GetMatchesRequest): Promise<PaginatedResponse<Match>> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/sports/matches`, { params });
    return response.data;
  }

  async getLiveMatches(): Promise<Match[]> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/sports/matches/live`);
    return response.data;
  }

  async getMatchDetails(matchId: string): Promise<Match & { groupedOdds: Record<string, Odds[]> }> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/sports/matches/${matchId}`);
    return response.data;
  }

  async placeBet(bet: CreateBetRequest): Promise<Bet> {
    const response = await axios.post(
      `${API_BASE_URL}/api/v1/sports/bets`,
      bet,
      { headers: this.getAuthHeaders() }
    );
    return response.data;
  }

  async getUserBets(page = 1, limit = 20): Promise<PaginatedResponse<Bet>> {
    const response = await axios.get(
      `${API_BASE_URL}/api/v1/sports/bets/my`,
      { 
        params: { page, limit },
        headers: this.getAuthHeaders() 
      }
    );
    return response.data;
  }
}

export const sportsAPI = new SportsAPI();