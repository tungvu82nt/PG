import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Tag, Button, Skeleton, Empty } from 'antd';
import { 
  NotificationOutlined, 
  ClockCircleOutlined, 
  FireOutlined,
  GiftOutlined,
  TrophyOutlined,
  RightOutlined
} from '@ant-design/icons';
import './NewsSection.css';

const { Title, Text, Paragraph } = Typography;

interface NewsItem {
  id: string;
  title: string;
  content: string;
  type: 'announcement' | 'promotion' | 'tournament' | 'maintenance' | 'winner';
  priority: 'high' | 'medium' | 'low';
  publishedAt: Date;
  isNew: boolean;
  imageUrl?: string;
}

interface NewsSectionProps {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({ 
  maxItems = 5, 
  showHeader = true, 
  compact = false 
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API
  const mockNews: NewsItem[] = [
    {
      id: '1',
      title: 'Khuyến Mãi Tết 2026 - Nhận Lì Xì Khủng',
      content: 'Chào mừng Tết Nguyên Đán 2026! Tham gia ngay để nhận lì xì lên đến 88,888,000 VND cùng nhiều phần quà hấp dẫn khác.',
      type: 'promotion',
      priority: 'high',
      publishedAt: new Date('2026-01-31'),
      isNew: true,
      imageUrl: '/assets/tet-promotion.jpg'
    },
    {
      id: '2',
      title: 'Giải Đấu Slots Tháng 2 - Tổng Giải Thưởng 500 Triệu',
      content: 'Tham gia giải đấu slots lớn nhất trong tháng với tổng giải thưởng lên đến 500 triệu VND. Đăng ký ngay!',
      type: 'tournament',
      priority: 'high',
      publishedAt: new Date('2026-01-30'),
      isNew: true
    },
    {
      id: '3',
      title: 'Bảo Trì Hệ Thống - 02/02/2026',
      content: 'Hệ thống sẽ được bảo trì từ 02:00 - 04:00 sáng ngày 02/02/2026 để nâng cấp và cải thiện trải nghiệm người dùng.',
      type: 'maintenance',
      priority: 'medium',
      publishedAt: new Date('2026-01-29'),
      isNew: false
    },
    {
      id: '4',
      title: 'Chúc Mừng Player***789 Trúng Jackpot 25 Tỷ',
      content: 'Xin chúc mừng Player***789 đã trúng jackpot khủng 25 tỷ VND tại game Fortune Tiger. Chúc mừng người chơi!',
      type: 'winner',
      priority: 'medium',
      publishedAt: new Date('2026-01-28'),
      isNew: false
    },
    {
      id: '5',
      title: 'Ra Mắt Game Mới - Dragon Tiger Live',
      content: 'PG88 chính thức ra mắt game Dragon Tiger Live với dealer xinh đẹp và tỷ lệ thắng hấp dẫn.',
      type: 'announcement',
      priority: 'low',
      publishedAt: new Date('2026-01-27'),
      isNew: false
    }
  ];

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setNews(mockNews.slice(0, maxItems));
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [maxItems]);

  const getNewsIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'promotion':
        return <GiftOutlined style={{ color: '#f5222d' }} />;
      case 'tournament':
        return <TrophyOutlined style={{ color: '#d0ad4a' }} />;
      case 'maintenance':
        return <NotificationOutlined style={{ color: '#faad14' }} />;
      case 'winner':
        return <FireOutlined style={{ color: '#52c41a' }} />;
      case 'announcement':
        return <NotificationOutlined style={{ color: '#1890ff' }} />;
      default:
        return <NotificationOutlined style={{ color: '#d0ad4a' }} />;
    }
  };

  const getNewsTypeText = (type: NewsItem['type']): string => {
    switch (type) {
      case 'promotion':
        return 'Khuyến Mãi';
      case 'tournament':
        return 'Giải Đấu';
      case 'maintenance':
        return 'Bảo Trì';
      case 'winner':
        return 'Người Thắng';
      case 'announcement':
        return 'Thông Báo';
      default:
        return 'Tin Tức';
    }
  };

  const getNewsTypeColor = (type: NewsItem['type']): string => {
    switch (type) {
      case 'promotion':
        return '#f5222d';
      case 'tournament':
        return '#d0ad4a';
      case 'maintenance':
        return '#faad14';
      case 'winner':
        return '#52c41a';
      case 'announcement':
        return '#1890ff';
      default:
        return '#d0ad4a';
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return (
      <div className={`news-section ${compact ? 'compact' : ''}`}>
        {showHeader && (
          <div className="news-header">
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              <NotificationOutlined style={{ marginRight: 8, color: '#d0ad4a' }} />
              Tin Tức & Thông Báo
            </Title>
          </div>
        )}
        <div className="news-list">
          {Array.from({ length: maxItems }).map((_, index) => (
            <Card key={index} className="news-item loading">
              <Skeleton active paragraph={{ rows: 2 }} />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className={`news-section ${compact ? 'compact' : ''}`}>
        {showHeader && (
          <div className="news-header">
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              <NotificationOutlined style={{ marginRight: 8, color: '#d0ad4a' }} />
              Tin Tức & Thông Báo
            </Title>
          </div>
        )}
        <Empty 
          description="Không có tin tức mới"
          style={{ color: 'white' }}
        />
      </div>
    );
  }

  return (
    <div className={`news-section ${compact ? 'compact' : ''}`}>
      {showHeader && (
        <div className="news-header">
          <Title level={4} style={{ color: 'white', margin: 0 }}>
            <NotificationOutlined style={{ marginRight: 8, color: '#d0ad4a' }} />
            Tin Tức & Thông Báo
          </Title>
          <Button 
            type="link" 
            style={{ color: '#d0ad4a', padding: 0 }}
            icon={<RightOutlined />}
          >
            Xem tất cả
          </Button>
        </div>
      )}

      <div className="news-list">
        {news.map((item) => (
          <Card 
            key={item.id} 
            className={`news-item ${item.priority} ${item.isNew ? 'new' : ''}`}
            hoverable
          >
            <div className="news-content">
              <div className="news-meta">
                <Space align="center" size={8}>
                  {getNewsIcon(item.type)}
                  <Tag 
                    color={getNewsTypeColor(item.type)}
                    style={{ margin: 0, fontSize: 11 }}
                  >
                    {getNewsTypeText(item.type)}
                  </Tag>
                  {item.isNew && (
                    <Tag color="#f5222d" style={{ margin: 0, fontSize: 10 }}>
                      MỚI
                    </Tag>
                  )}
                </Space>
                
                <Space align="center" size={4} style={{ color: '#888', fontSize: 12 }}>
                  <ClockCircleOutlined />
                  <Text style={{ color: '#888', fontSize: 12 }}>
                    {formatDate(item.publishedAt)}
                  </Text>
                </Space>
              </div>

              <div className="news-body">
                <Title 
                  level={5} 
                  style={{ 
                    color: 'white', 
                    margin: '8px 0 4px 0',
                    fontSize: compact ? 14 : 16,
                    lineHeight: 1.4
                  }}
                >
                  {item.title}
                </Title>
                
                <Paragraph 
                  style={{ 
                    color: '#ccc', 
                    margin: 0,
                    fontSize: compact ? 12 : 13,
                    lineHeight: 1.5
                  }}
                  ellipsis={{ rows: compact ? 2 : 3, expandable: false }}
                >
                  {item.content}
                </Paragraph>
              </div>

              {item.priority === 'high' && (
                <div className="priority-indicator high">
                  <FireOutlined />
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {!compact && (
        <div className="news-footer">
          <Button 
            type="primary" 
            ghost 
            block
            style={{ 
              borderColor: '#d0ad4a', 
              color: '#d0ad4a',
              height: 40
            }}
          >
            Xem Thêm Tin Tức
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewsSection;