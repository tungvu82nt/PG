import React from 'react';
import { Row, Col, Button, Typography, Card } from 'antd';
import { PlayCircleOutlined, GiftOutlined, TrophyOutlined } from '@ant-design/icons';
import './PromotionSection.css';

const { Title, Text } = Typography;

const PromotionSection: React.FC = () => {
  const promotions = [
    {
      id: 1,
      title: 'WELCOME BONUS',
      subtitle: 'Thưởng 100% lần đầu nạp',
      description: 'Nhận ngay 100% tiền thưởng cho lần nạp đầu tiên',
      image: 'https://img.ihudba.com/img/static/desktop/live-full/dg/girl.png',
      buttonText: 'Chơi Ngay',
      gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)',
      icon: <GiftOutlined />
    },
    {
      id: 2,
      title: 'DAILY CASHBACK',
      subtitle: 'Hoàn tiền hàng ngày',
      description: 'Hoàn tiền lên đến 10% mỗi ngày cho tất cả game',
      image: 'https://img.ihudba.com/img/static/desktop/live-full/sa/girl.png',
      buttonText: 'Chơi Ngay',
      gradient: 'linear-gradient(135deg, #4ECDC4 0%, #44A08D 100%)',
      icon: <TrophyOutlined />
    },
    {
      id: 3,
      title: 'VIP REWARDS',
      subtitle: 'Đặc quyền VIP',
      description: 'Ưu đãi độc quyền dành cho thành viên VIP',
      image: 'https://img.ihudba.com/img/static/desktop/live-full/wm/girl.png',
      buttonText: 'Chơi Ngay',
      gradient: 'linear-gradient(135deg, #A8EDEA 0%, #FED6E3 100%)',
      icon: <PlayCircleOutlined />
    }
  ];

  return (
    <div className="promotion-section">
      <div className="promotion-header">
        <Title level={2} className="promotion-title">
          <GiftOutlined className="promotion-title-icon" />
          KHUYẾN MÃI HOT
        </Title>
        <Text className="promotion-subtitle">
          Nhận ngay ưu đãi khủng - Cơ hội vàng không thể bỏ lỡ!
        </Text>
      </div>

      <Row gutter={[24, 24]} className="promotion-cards">
        {promotions.map((promo) => (
          <Col xs={24} md={8} key={promo.id}>
            <Card
              className="promotion-card"
              style={{ background: promo.gradient }}
              bordered={false}
              hoverable
            >
              <div className="promotion-card-content">
                <div className="promotion-card-left">
                  <div className="promotion-badge">
                    {promo.icon}
                    <span>HOT</span>
                  </div>
                  <Title level={4} className="promotion-card-title">
                    {promo.title}
                  </Title>
                  <Text className="promotion-card-subtitle">
                    {promo.subtitle}
                  </Text>
                  <Text className="promotion-card-description">
                    {promo.description}
                  </Text>
                  <Button 
                    type="primary" 
                    size="large"
                    className="promotion-play-btn"
                    icon={<PlayCircleOutlined />}
                  >
                    {promo.buttonText}
                  </Button>
                </div>
                <div className="promotion-card-right">
                  <div className="promotion-character">
                    <img 
                      src={promo.image} 
                      alt={promo.title}
                      className="promotion-character-img"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PromotionSection;