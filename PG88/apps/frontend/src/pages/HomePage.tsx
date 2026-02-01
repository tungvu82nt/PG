import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Card, Carousel, Button } from 'antd'
import { FireOutlined, TrophyOutlined } from '@ant-design/icons'
import MainLayout from '../layouts/MainLayout'
import BannerCarousel from '../components/BannerCarousel/BannerCarousel'
import WinnersTicker from '../components/WinnersTicker/WinnersTicker'
import NewsSection from '../components/NewsSection/NewsSection'
import './HomePage.css'

const { Title, Text } = Typography

// Local assets from downloaded images
const banners = [
  '/assets/banners/ad-403796ae-539d-4e50-9692-7328c8650bea.webp',
  '/assets/banners/ad-e7d1e36c-f082-4c27-bdc4-fc94543a39d3.webp',
  '/assets/banners/ad-b729fb9e-b61b-4ad2-ac9d-c9339bfaeb84.webp',
]

const categories = [
  { key: 'games', label: 'Trò chơi', img: '/assets/categories/cate-egame.png' },
  { key: 'chess', label: 'Chess', img: '/assets/categories/cate-chess.png' },
  { key: 'fishing', label: 'Bắn cá', img: '/assets/categories/cate-mpg.png' },
  { key: 'cockfight', label: 'Đá Gà', img: '/assets/categories/cate-animal.png' },
  { key: 'lottery', label: 'Xổ số', img: '/assets/categories/cate-lottery.png' },
]

const midBanners = [
  { img: '/assets/banners/mid-live.png', title: 'Live Casino' },
  { img: '/assets/banners/mid-egame.png', title: 'E-Game' },
  { img: '/assets/banners/mid-sports.png', title: 'Sports' },
]

const hotGames = [
  { name: 'Kho Báu Aztec', provider: 'PG', img: '/assets/games/popular-98e20603-39bd-49a8-88fd-f138f4190827.webp' },
  { name: 'Đường Mạt Chược 2', provider: 'PG', img: '/assets/games/popular-1a987bf2-47de-469f-ab31-dcaac1fde5cd.webp' },
  { name: 'Sexy casino', provider: 'SEXYBCRT', img: '/assets/games/popular-ee141b3e-1d2f-48d1-8291-b11ce34b5a6f.webp' },
  { name: 'Jackpot Đánh Cá', provider: 'JILI', img: '/assets/games/popular-14e31f9b-adb7-4742-8887-15d25cc7b4da.webp' },
  { name: 'Đường Mạt Chược', provider: 'PG', img: '/assets/games/popular-354813aa-ae44-4969-955d-dadab65aa749.webp' },
  { name: 'DG Casino', provider: 'DG', img: '/assets/games/popular-4b4c89d9-0bd9-452e-a664-1067d2d41580.webp' },
  { name: 'Siêu Cấp Ace', provider: 'JILI', img: '/assets/games/popular-13fc3271-0abc-46c8-8acb-9c2bb4567880.webp' },
  { name: 'Đế quốc hoàng kim', provider: 'JILI', img: '/assets/games/popular-9bebda63-8407-4b51-82be-5bcaeadc9e65.webp' },
  { name: 'chọi gà', provider: 'GA28', img: '/assets/games/popular-c8c34042-4fe7-4468-86b3-0ba31639567c.png' },
  { name: 'BÁT TỤ BẢO', provider: 'JDB', img: '/assets/games/popular-7828aa4a-b86d-4ed0-98c3-dd99b81201f1.webp' },
]

const liveCasino = [
  { name: 'via_casino', img: '/assets/casino/preview-via_casino.png' },
  { name: 'dg', img: '/assets/casino/preview-dg.png' },
  { name: 'sexybcrt', img: '/assets/casino/preview-sexybcrt.png' },
  { name: 'sa', img: '/assets/casino/preview-sa.png' },
  { name: 'wm', img: '/assets/casino/preview-wm.png' },
]

const HomePage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-animation">
          <div className="loading-spinner"></div>
          <Text className="loading-text" style={{ color: '#d0ad4a' }}>Loading PG88...</Text>
        </div>
      </div>
    )
  }

  return (
    <MainLayout>
      {/* Winners Ticker - Fixed Position */}
      <WinnersTicker />

      {/* Hero Section */}
      <div className="hero-section" style={{ marginBottom: 24 }}>
        <Carousel autoplay effect="fade">
          {banners.map((src, index) => (
            <div key={index}>
              <div
                style={{
                  height: '480px', // Increased height to match real site
                  backgroundImage: `url(${src})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 16px' }}>

        {/* News Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: 40 }}>
          <Col xs={24} lg={16}>
            {/* Enhanced Category Nav */}
            <Row gutter={[16, 16]} style={{ marginBottom: 40 }} justify="center">
              {categories.map((cat) => (
                <Col xs={12} sm={8} md={4} key={cat.key}>
                  <div
                    className="category-card"
                    style={{
                      position: 'relative',
                      borderRadius: 12,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      height: 140,
                      border: '2px solid #d0ad4a',
                      boxShadow: '0 4px 16px rgba(208, 173, 74, 0.3)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(208, 173, 74, 0.5)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0) scale(1)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(208, 173, 74, 0.3)';
                    }}
                  >
                    {/* Background Image */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundImage: `url(${cat.img})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'brightness(0.7)',
                      }}
                    />

                    {/* Overlay Gradient */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(135deg, rgba(208, 173, 74, 0.2) 0%, rgba(0, 0, 0, 0.6) 100%)',
                      }}
                    />

                    {/* Content */}
                    <div
                      style={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px',
                        textAlign: 'center',
                        zIndex: 2,
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: '#d0ad4a',
                          fontSize: 16,
                          fontWeight: 'bold',
                          textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
                          marginBottom: 8,
                          textTransform: 'uppercase',
                          letterSpacing: '1px'
                        }}
                      >
                        {cat.label}
                      </Text>
                      <Button
                        size="small"
                        shape="round"
                        style={{
                          background: 'rgba(208, 173, 74, 0.9)',
                          borderColor: '#d0ad4a',
                          color: '#000',
                          fontSize: 11,
                          fontWeight: 'bold',
                          height: 28,
                          padding: '0 16px',
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        }}
                      >
                        PLAY NOW
                      </Button>
                    </div>

                    {/* Gold Corner Accent */}
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        background: '#d0ad4a',
                        borderRadius: '50%',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        zIndex: 3,
                      }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Col>

          <Col xs={24} lg={8}>
            <NewsSection maxItems={4} compact />
          </Col>
        </Row>


        {/* Mid Section Banners */}
        <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
          {midBanners.map((banner, index) => (
            <Col xs={24} md={8} key={index}>
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 12, cursor: 'pointer' }}>
                <img
                  src={banner.img}
                  alt={banner.title}
                  style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                />
                <Button
                  type="primary"
                  shape="round"
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#d0ad4a',
                    color: 'black',
                    fontWeight: 'bold',
                    border: 'none',
                    padding: '0 30px'
                  }}
                >
                  Chơi Ngay
                </Button>
              </div>
            </Col>
          ))}
        </Row>

        {/* Enhanced Banner Carousel */}
        <BannerCarousel />

        {/* Enhanced Hot Games */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20, justifyContent: 'center' }}>
            <div style={{
              background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
              borderRadius: '50%',
              padding: 12,
              marginRight: 16,
              boxShadow: '0 4px 16px rgba(255, 77, 79, 0.4)'
            }}>
              <FireOutlined style={{ fontSize: 24, color: 'white' }} />
            </div>
            <Title level={2} style={{
              margin: 0,
              color: 'white',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.5)',
              fontSize: 28,
              fontWeight: 'bold'
            }}>
              TRÒ CHƠI HOT
            </Title>
          </div>

          <Row gutter={[16, 16]}>
            {hotGames.map((game, i) => (
              <Col xs={12} sm={8} md={4} key={i}>
                <Card
                  hoverable
                  bordered={false}
                  className="hot-game-card"
                  style={{
                    background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
                    overflow: 'hidden',
                    border: '1px solid rgba(208, 173, 74, 0.3)',
                    borderRadius: 12,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
                    transition: 'all 0.3s ease',
                  }}
                  bodyStyle={{ padding: '12px' }}
                  cover={
                    <div style={{
                      height: 160,
                      overflow: 'hidden',
                      position: 'relative',
                      borderRadius: '12px 12px 0 0'
                    }}>
                      <img
                        src={game.img}
                        alt={game.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease',
                          filter: 'brightness(1.1) contrast(1.1)'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'scale(1.1)';
                          const parent = e.currentTarget.parentElement?.parentElement;
                          if (parent) {
                            parent.style.boxShadow = '0 8px 32px rgba(208, 173, 74, 0.4)';
                            parent.style.transform = 'translateY(-4px)';
                          }
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'scale(1)';
                          const parent = e.currentTarget.parentElement?.parentElement;
                          if (parent) {
                            parent.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.3)';
                            parent.style.transform = 'translateY(0)';
                          }
                        }}
                      />

                      {/* Glow Effect Overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(208, 173, 74, 0.1) 0%, transparent 50%, rgba(255, 255, 255, 0.1) 100%)',
                        pointerEvents: 'none'
                      }} />

                      <div className="game-provider-badge" style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'linear-gradient(135deg, rgba(208, 173, 74, 0.9) 0%, rgba(255, 215, 0, 0.9) 100%)',
                        padding: '4px 8px',
                        borderRadius: 12,
                        fontSize: 10,
                        color: '#000',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.3)'
                      }}>
                        {game.provider}
                      </div>

                      {/* Hot Badge */}
                      <div style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                        padding: '2px 6px',
                        borderRadius: 8,
                        fontSize: 9,
                        color: 'white',
                        fontWeight: 'bold',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
                        animation: 'pulse 2s infinite'
                      }}>
                        HOT
                      </div>
                    </div>
                  }
                >
                  <Card.Meta
                    title={
                      <Text style={{
                        color: 'white',
                        fontSize: 14,
                        fontWeight: 600,
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.5)'
                      }} ellipsis>
                        {game.name}
                      </Text>
                    }
                    description={
                      <Button
                        type="primary"
                        size="small"
                        block
                        style={{
                          marginTop: 8,
                          background: 'linear-gradient(135deg, #d0ad4a 0%, #ffd700 100%)',
                          color: '#000',
                          border: 'none',
                          fontWeight: 'bold',
                          borderRadius: 20,
                          height: 32,
                          boxShadow: '0 2px 8px rgba(208, 173, 74, 0.4)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(208, 173, 74, 0.6)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(208, 173, 74, 0.4)';
                        }}
                      >
                        Chơi Ngay
                      </Button>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Live Casino Preview */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 20 }}>
            <TrophyOutlined style={{ fontSize: 24, color: '#d0ad4a', marginRight: 10 }} />
            <Title level={3} style={{ margin: 0, color: 'white' }}>LIVE CASINO</Title>
          </div>

          <Row gutter={[16, 16]}>
            {liveCasino.map((provider) => (
              <Col xs={24} sm={12} md={4} key={provider.name}> {/* Changed grid span to fit 5 items approx */}
                <div
                  className="casino-card"
                  style={{
                    borderRadius: 12,
                    position: 'relative',
                    border: '1px solid #374151',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#d0ad4a';
                    e.currentTarget.style.transform = 'translateY(-5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#374151';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <img
                    src={provider.img}
                    alt={provider.name}
                    style={{
                      width: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    padding: '10px',
                    background: 'linear-gradient(0deg, #000 0%, transparent 100%)',
                    textAlign: 'center'
                  }}>
                    <Text strong style={{ color: 'white', textTransform: 'uppercase' }}>{provider.name}</Text>
                  </div>
                </div>
              </Col>
            ))}
          </Row>
        </div>

      </div>
    </MainLayout>
  )
}

export default HomePage
