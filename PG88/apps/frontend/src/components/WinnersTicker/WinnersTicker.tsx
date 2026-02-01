import React, { useState, useEffect } from 'react';
import { Typography, Avatar, Space } from 'antd';
import { TrophyOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import './WinnersTicker.css';

const { Text } = Typography;

interface Winner {
  id: string;
  username: string;
  game: string;
  amount: number;
  timestamp: Date;
  type: 'jackpot' | 'big_win' | 'mega_win';
}

const WinnersTicker: React.FC = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock data - in real app, this would come from WebSocket or API
  const mockWinners: Winner[] = [
    {
      id: '1',
      username: 'Player***123',
      game: 'Fortune Tiger',
      amount: 15000000,
      timestamp: new Date(),
      type: 'jackpot'
    },
    {
      id: '2',
      username: 'Lucky***789',
      game: 'Sweet Bonanza',
      amount: 8500000,
      timestamp: new Date(),
      type: 'mega_win'
    },
    {
      id: '3',
      username: 'Winner***456',
      game: 'Gates of Olympus',
      amount: 3200000,
      timestamp: new Date(),
      type: 'big_win'
    },
    {
      id: '4',
      username: 'Gold***999',
      game: 'Crazy Time',
      amount: 25000000,
      timestamp: new Date(),
      type: 'jackpot'
    },
    {
      id: '5',
      username: 'Rich***888',
      game: 'Lightning Roulette',
      amount: 12000000,
      timestamp: new Date(),
      type: 'mega_win'
    }
  ];

  useEffect(() => {
    setWinners(mockWinners);
  }, []);

  useEffect(() => {
    if (winners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % winners.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [winners.length]);

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getWinIcon = (type: Winner['type']) => {
    switch (type) {
      case 'jackpot':
        return <CrownOutlined style={{ color: '#ffd700', fontSize: 16 }} />;
      case 'mega_win':
        return <TrophyOutlined style={{ color: '#ff6b35', fontSize: 16 }} />;
      case 'big_win':
        return <StarOutlined style={{ color: '#52c41a', fontSize: 16 }} />;
      default:
        return <TrophyOutlined style={{ color: '#d0ad4a', fontSize: 16 }} />;
    }
  };

  const getWinTypeText = (type: Winner['type']): string => {
    switch (type) {
      case 'jackpot':
        return 'JACKPOT';
      case 'mega_win':
        return 'MEGA WIN';
      case 'big_win':
        return 'BIG WIN';
      default:
        return 'WIN';
    }
  };

  const getWinTypeColor = (type: Winner['type']): string => {
    switch (type) {
      case 'jackpot':
        return '#ffd700';
      case 'mega_win':
        return '#ff6b35';
      case 'big_win':
        return '#52c41a';
      default:
        return '#d0ad4a';
    }
  };

  if (winners.length === 0) return null;

  const currentWinner = winners[currentIndex];

  return (
    <div className="winners-ticker">
      <div className="ticker-container">
        <div className="ticker-content">
          <Space align="center" size={12}>
            <div className="win-icon">
              {getWinIcon(currentWinner.type)}
            </div>
            
            <div className="winner-info">
              <div className="win-type" style={{ color: getWinTypeColor(currentWinner.type) }}>
                {getWinTypeText(currentWinner.type)}
              </div>
              
              <div className="winner-details">
                <Text strong style={{ color: 'white', fontSize: 13 }}>
                  {currentWinner.username}
                </Text>
                <Text style={{ color: '#d0ad4a', fontSize: 12, marginLeft: 8 }}>
                  won {formatAmount(currentWinner.amount)}
                </Text>
              </div>
              
              <Text style={{ color: '#888', fontSize: 11 }}>
                playing {currentWinner.game}
              </Text>
            </div>

            <Avatar
              size={32}
              style={{
                backgroundColor: getWinTypeColor(currentWinner.type),
                color: '#000',
                fontWeight: 'bold'
              }}
            >
              {currentWinner.username.charAt(0).toUpperCase()}
            </Avatar>
          </Space>
        </div>

        <div className="ticker-indicators">
          {winners.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default WinnersTicker;