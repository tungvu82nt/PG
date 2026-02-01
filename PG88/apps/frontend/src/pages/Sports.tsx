import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Tabs, Button, Badge, Typography, Spin, message, InputNumber } from 'antd';
import { TrophyOutlined, FireOutlined, ClockCircleOutlined } from '@ant-design/icons';
import MainLayout from '../layouts/MainLayout';
import { sportsAPI, Sport, Match, Odds, CreateBetRequest } from '../api/sports';
import { useAuthStore } from '../store/auth.store';
import './Sports.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface BettingSlip {
  match: Match;
  odds: Odds;
  amount: number;
}

const Sports: React.FC = () => {
  const [sports, setSports] = useState<Sport[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSport, setSelectedSport] = useState<string>('');
  const [bettingSlip, setBettingSlip] = useState<BettingSlip[]>([]);
  const [placingBet, setPlacingBet] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    loadSports();
  }, []);

  useEffect(() => {
    if (selectedSport) {
      loadMatches();
    }
  }, [selectedSport]);

  const loadSports = async () => {
    try {
      const sportsData = await sportsAPI.getSports();
      setSports(sportsData);
      if (sportsData.length > 0) {
        setSelectedSport(sportsData[0].id);
      }
    } catch (error) {
      message.error('Failed to load sports');
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const response = await sportsAPI.getMatches({
        sportId: selectedSport,
        limit: 50
      });
      setMatches(response.data);
    } catch (error) {
      message.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const addToBettingSlip = (match: Match, odds: Odds) => {
    if (!isAuthenticated) {
      message.warning('Please login to place bets');
      return;
    }

    const existingBet = bettingSlip.find(bet => bet.odds.id === odds.id);
    if (existingBet) {
      message.info('This bet is already in your slip');
      return;
    }

    setBettingSlip([...bettingSlip, { match, odds, amount: 10 }]);
    message.success('Added to betting slip');
  };

  const removeFromBettingSlip = (oddsId: string) => {
    setBettingSlip(bettingSlip.filter(bet => bet.odds.id !== oddsId));
  };

  const updateBetAmount = (oddsId: string, amount: number) => {
    setBettingSlip(bettingSlip.map(bet =>
      bet.odds.id === oddsId ? { ...bet, amount } : bet
    ));
  };

  const placeBets = async () => {
    if (bettingSlip.length === 0) return;

    setPlacingBet(true);
    try {
      for (const bet of bettingSlip) {
        const betRequest: CreateBetRequest = {
          matchId: bet.match.id,
          oddsId: bet.odds.id,
          amount: bet.amount,
          selection: bet.odds.selection,
          market: bet.odds.market,
          odds: bet.odds.odds
        };
        await sportsAPI.placeBet(betRequest);
      }

      message.success(`Successfully placed ${bettingSlip.length} bet(s)`);
      setBettingSlip([]);
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Failed to place bets');
    } finally {
      setPlacingBet(false);
    }
  };

  const getTotalStake = () => {
    return bettingSlip.reduce((total, bet) => total + bet.amount, 0);
  };

  const getTotalPotentialWin = () => {
    return bettingSlip.reduce((total, bet) => total + (bet.amount * bet.odds.odds), 0);
  };

  const getMatchStatusBadge = (match: Match) => {
    if (match.isLive) {
      return <Badge status="processing" text="LIVE" />;
    }
    
    switch (match.status) {
      case 'scheduled':
        return <Badge status="default" text="Scheduled" />;
      case 'finished':
        return <Badge status="success" text="Finished" />;
      case 'cancelled':
        return <Badge status="error" text="Cancelled" />;
      case 'postponed':
        return <Badge status="warning" text="Postponed" />;
      default:
        return <Badge status="default" text={match.status} />;
    }
  };

  const renderMatchCard = (match: Match) => (
    <Card
      key={match.id}
      className="match-card"
      style={{ marginBottom: 16 }}
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text strong>{match.league.displayName}</Text>
          {getMatchStatusBadge(match)}
        </div>
      }
    >
      <Row gutter={16} align="middle">
        <Col span={8}>
          <div className="team-info">
            <div className="team">
              {match.homeTeamLogo && (
                <img src={match.homeTeamLogo} alt={match.homeTeam} className="team-logo" />
              )}
              <Text strong>{match.homeTeam}</Text>
            </div>
            <div className="team">
              {match.awayTeamLogo && (
                <img src={match.awayTeamLogo} alt={match.awayTeam} className="team-logo" />
              )}
              <Text strong>{match.awayTeam}</Text>
            </div>
          </div>
        </Col>
        
        <Col span={4} style={{ textAlign: 'center' }}>
          {match.isLive ? (
            <div className="live-score">
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                {match.homeScore} - {match.awayScore}
              </Text>
              <div>
                <Text type="secondary">{match.minute}'</Text>
              </div>
            </div>
          ) : (
            <div className="match-time">
              <ClockCircleOutlined />
              <Text type="secondary">
                {new Date(match.startTime).toLocaleString()}
              </Text>
            </div>
          )}
        </Col>

        <Col span={12}>
          <div className="odds-container">
            {match.odds
              .filter(odds => odds.betType === 'match_winner' && odds.isActive)
              .map(odds => (
                <Button
                  key={odds.id}
                  className="odds-button"
                  onClick={() => addToBettingSlip(match, odds)}
                  disabled={!match.isBettingActive}
                >
                  <div className="odds-content">
                    <Text strong>{odds.selection}</Text>
                    <Text className="odds-value">{odds.odds.toFixed(2)}</Text>
                  </div>
                </Button>
              ))}
          </div>
        </Col>
      </Row>
    </Card>
  );

  return (
    <MainLayout>
      <div className="sports-page">
        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 16px' }}>
          <div style={{ marginBottom: 24 }}>
            <Title level={2} style={{ color: 'white', display: 'flex', alignItems: 'center' }}>
              <TrophyOutlined style={{ marginRight: 12, color: '#d0ad4a' }} />
              THỂ THAO
            </Title>
          </div>

          <Row gutter={24}>
            <Col span={18}>
              <Card className="sports-main-card">
                <Tabs
                  activeKey={selectedSport}
                  onChange={setSelectedSport}
                  className="sports-tabs"
                >
                  {sports.map(sport => (
                    <TabPane
                      tab={
                        <span>
                          {sport.icon && <img src={sport.icon} alt={sport.name} className="sport-icon" />}
                          {sport.displayName}
                        </span>
                      }
                      key={sport.id}
                    >
                      <div className="matches-container">
                        {loading ? (
                          <div style={{ textAlign: 'center', padding: 40 }}>
                            <Spin size="large" />
                          </div>
                        ) : matches.length > 0 ? (
                          matches.map(renderMatchCard)
                        ) : (
                          <div style={{ textAlign: 'center', padding: 40 }}>
                            <Text type="secondary">No matches available</Text>
                          </div>
                        )}
                      </div>
                    </TabPane>
                  ))}
                </Tabs>
              </Card>
            </Col>

            <Col span={6}>
              <Card
                title={
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FireOutlined style={{ marginRight: 8, color: '#ff4d4f' }} />
                    Betting Slip
                    {bettingSlip.length > 0 && (
                      <Badge count={bettingSlip.length} style={{ marginLeft: 8 }} />
                    )}
                  </div>
                }
                className="betting-slip-card"
              >
                {bettingSlip.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 20 }}>
                    <Text type="secondary">No bets selected</Text>
                  </div>
                ) : (
                  <div>
                    {bettingSlip.map(bet => (
                      <div key={bet.odds.id} className="betting-slip-item">
                        <div className="bet-header">
                          <Text strong>{bet.match.homeTeam} vs {bet.match.awayTeam}</Text>
                          <Button
                            type="text"
                            size="small"
                            onClick={() => removeFromBettingSlip(bet.odds.id)}
                          >
                            ×
                          </Button>
                        </div>
                        <div className="bet-selection">
                          <Text>{bet.odds.selection} @ {bet.odds.odds.toFixed(2)}</Text>
                        </div>
                        <div className="bet-amount">
                          <InputNumber
                            min={1}
                            max={10000}
                            value={bet.amount}
                            onChange={(value) => updateBetAmount(bet.odds.id, value || 1)}
                            addonBefore="Amount"
                            style={{ width: '100%' }}
                          />
                        </div>
                        <div className="bet-potential-win">
                          <Text type="secondary">
                            Potential Win: {(bet.amount * bet.odds.odds).toFixed(2)} VND
                          </Text>
                        </div>
                      </div>
                    ))}

                    <div className="betting-slip-summary">
                      <div className="summary-row">
                        <Text>Total Stake:</Text>
                        <Text strong>{getTotalStake().toFixed(2)} VND</Text>
                      </div>
                      <div className="summary-row">
                        <Text>Potential Win:</Text>
                        <Text strong style={{ color: '#52c41a' }}>
                          {getTotalPotentialWin().toFixed(2)} VND
                        </Text>
                      </div>
                    </div>

                    <Button
                      type="primary"
                      block
                      size="large"
                      loading={placingBet}
                      onClick={placeBets}
                      disabled={!isAuthenticated}
                      style={{
                        background: '#d0ad4a',
                        borderColor: '#d0ad4a',
                        color: '#000',
                        fontWeight: 'bold'
                      }}
                    >
                      {!isAuthenticated ? 'Login to Bet' : 'Place Bets'}
                    </Button>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </MainLayout>
  );
};

export default Sports;