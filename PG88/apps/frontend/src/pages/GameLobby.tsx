import React, { useState, useEffect, useMemo } from 'react'
import { 
  Card, 
  Typography, 
  Row, 
  Col, 
  Input, 
  Select, 
  Tabs, 
  Button, 
  Tag, 
  Space, 
  Spin,
  Empty,
  Badge,
  message
} from 'antd'
import {
  SearchOutlined,
  PlayCircleOutlined,
  FireOutlined,
  TrophyOutlined,
  StarOutlined,
  ThunderboltOutlined
} from '@ant-design/icons'
import UserLayout from '../layouts/UserLayout'
import './GameLobby.css'

const { Title, Text } = Typography
const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs

interface Game {
  id: string
  name: string
  provider: string
  category: string
  image: string
  isHot?: boolean
  isNew?: boolean
  jackpot?: number
  minBet?: number
  maxBet?: number
  rtp?: number
}

interface GameProvider {
  id: string
  name: string
  logo: string
  gameCount: number
}

const GameLobby: React.FC = () => {
  const [games, setGames] = useState<Game[]>([])
  const [providers, setProviders] = useState<GameProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedProvider, setSelectedProvider] = useState('all')
  const [sortBy, setSortBy] = useState('popular')

  // Mock data for games
  const mockGames: Game[] = [
    {
      id: '1',
      name: 'Kho Báu Aztec',
      provider: 'PG',
      category: 'slots',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/98e20603-39bd-49a8-88fd-f138f4190827.webp',
      isHot: true,
      jackpot: 5000000,
      minBet: 1000,
      maxBet: 100000,
      rtp: 96.5
    },
    {
      id: '2',
      name: 'Đường Mạt Chược 2',
      provider: 'PG',
      category: 'slots',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/1a987bf2-47de-469f-ab31-dcaac1fde5cd.webp',
      isNew: true,
      minBet: 500,
      maxBet: 50000,
      rtp: 97.2
    },
    {
      id: '3',
      name: 'Sexy Casino',
      provider: 'SEXYBCRT',
      category: 'live',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/ee141b3e-1d2f-48d1-8291-b11ce34b5a6f.webp',
      isHot: true,
      minBet: 10000,
      maxBet: 1000000
    },
    {
      id: '4',
      name: 'Jackpot Đánh Cá',
      provider: 'JILI',
      category: 'fishing',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/14e31f9b-adb7-4742-8887-15d25cc7b4da.webp',
      jackpot: 2500000,
      minBet: 1000,
      maxBet: 200000,
      rtp: 95.8
    },
    {
      id: '5',
      name: 'DG Casino',
      provider: 'DG',
      category: 'live',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/4b4c89d9-0bd9-452e-a664-1067d2d41580.webp',
      minBet: 5000,
      maxBet: 500000
    },
    {
      id: '6',
      name: 'Siêu Cấp Ace',
      provider: 'JILI',
      category: 'slots',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/13fc3271-0abc-46c8-8acb-9c2bb4567880.webp',
      isNew: true,
      minBet: 500,
      maxBet: 100000,
      rtp: 96.8
    },
    {
      id: '7',
      name: 'Đế quốc hoàng kim',
      provider: 'JILI',
      category: 'slots',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/9bebda63-8407-4b51-82be-5bcaeadc9e65.webp',
      jackpot: 8000000,
      minBet: 1000,
      maxBet: 150000,
      rtp: 97.5
    },
    {
      id: '8',
      name: 'Chọi Gà',
      provider: 'GA28',
      category: 'animal',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/c8c34042-4fe7-4468-86b3-0ba31639567c.png',
      isHot: true,
      minBet: 10000,
      maxBet: 1000000
    },
    {
      id: '9',
      name: 'BÁT TỤ BẢO',
      provider: 'JDB',
      category: 'slots',
      image: 'https://img.ihudba.com/img/009vn/gamePopular/7828aa4a-b86d-4ed0-98c3-dd99b81201f1.webp',
      minBet: 500,
      maxBet: 80000,
      rtp: 96.2
    }
  ]

  const mockProviders: GameProvider[] = [
    { id: 'PG', name: 'PG Soft', logo: 'https://img.ihudba.com/img/static/gplogo/h-dark/pg.png', gameCount: 150 },
    { id: 'JILI', name: 'JILI', logo: 'https://img.ihudba.com/img/static/gplogo/h-dark/jili.png', gameCount: 120 },
    { id: 'SEXYBCRT', name: 'Sexy Baccarat', logo: 'https://img.ihudba.com/img/static/gplogo/h-dark/sexybcrt.png', gameCount: 80 },
    { id: 'DG', name: 'Dream Gaming', logo: 'https://img.ihudba.com/img/static/gplogo/h-dark/dg.png', gameCount: 60 },
    { id: 'JDB', name: 'JDB', logo: 'https://img.ihudba.com/img/static/gplogo/h-dark/jdb.png', gameCount: 90 },
    { id: 'GA28', name: 'GA28', logo: 'https://img.ihudba.com/img/static/gplogo/h-dark/ga28.png', gameCount: 40 }
  ]

  const categories = [
    { key: 'all', label: 'Tất Cả', icon: <PlayCircleOutlined />, count: mockGames.length },
    { key: 'slots', label: 'Slots', icon: <ThunderboltOutlined />, count: mockGames.filter(g => g.category === 'slots').length },
    { key: 'live', label: 'Live Casino', icon: <TrophyOutlined />, count: mockGames.filter(g => g.category === 'live').length },
    { key: 'fishing', label: 'Bắn Cá', icon: <StarOutlined />, count: mockGames.filter(g => g.category === 'fishing').length },
    { key: 'animal', label: 'Đá Gà', icon: <FireOutlined />, count: mockGames.filter(g => g.category === 'animal').length }
  ]

  useEffect(() => {
    fetchGames()
    fetchProviders()
  }, [])

  const fetchGames = async () => {
    try {
      // const response = await apiClient.get('/games')
      // setGames(response.data || [])
      
      // Use mock data for now
      setTimeout(() => {
        setGames(mockGames)
        setLoading(false)
      }, 1000)
    } catch (error: any) {
      setGames(mockGames)
      setLoading(false)
    }
  }

  const fetchProviders = async () => {
    try {
      // const response = await apiClient.get('/providers')
      // setProviders(response.data || [])
      
      // Use mock data for now
      setProviders(mockProviders)
    } catch (error: any) {
      setProviders(mockProviders)
    }
  }

  const filteredGames = useMemo(() => {
    let filtered = games

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category === selectedCategory)
    }

    // Filter by provider
    if (selectedProvider !== 'all') {
      filtered = filtered.filter(game => game.provider === selectedProvider)
    }

    // Sort games
    switch (sortBy) {
      case 'popular':
        filtered = filtered.sort((a, b) => (b.isHot ? 1 : 0) - (a.isHot ? 1 : 0))
        break
      case 'newest':
        filtered = filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0))
        break
      case 'jackpot':
        filtered = filtered.sort((a, b) => (b.jackpot || 0) - (a.jackpot || 0))
        break
      case 'rtp':
        filtered = filtered.sort((a, b) => (b.rtp || 0) - (a.rtp || 0))
        break
      default:
        break
    }

    return filtered
  }, [games, searchTerm, selectedCategory, selectedProvider, sortBy])

  const handleGameLaunch = async (game: Game) => {
    try {
      message.loading('Đang khởi động game...', 1)
      // const response = await apiClient.post(`/games/${game.id}/launch`)
      // window.open(response.data.gameUrl, '_blank')
      
      // Mock game launch
      setTimeout(() => {
        message.success(`Đã khởi động ${game.name}!`)
        // In real implementation, this would open the game in a new window/iframe
      }, 1000)
    } catch (error: any) {
      message.error('Không thể khởi động game. Vui lòng thử lại!')
    }
  }

  const renderGameCard = (game: Game) => (
    <Col xs={12} sm={8} md={6} lg={4} key={game.id}>
      <Card
        className="game-card"
        hoverable
        bordered={false}
        cover={
          <div className="game-card-cover">
            <img
              src={game.image}
              alt={game.name}
              className="game-image"
            />
            <div className="game-overlay">
              <Button
                type="primary"
                shape="circle"
                size="large"
                icon={<PlayCircleOutlined />}
                className="play-button"
                onClick={() => handleGameLaunch(game)}
              />
            </div>
            
            {/* Game badges */}
            <div className="game-badges">
              {game.isHot && (
                <Badge className="hot-badge" count="HOT" />
              )}
              {game.isNew && (
                <Badge className="new-badge" count="NEW" />
              )}
            </div>
            
            {/* Provider badge */}
            <div className="provider-badge">
              <Tag color="gold">{game.provider}</Tag>
            </div>
          </div>
        }
      >
        <Card.Meta
          title={
            <Text className="game-title" ellipsis>
              {game.name}
            </Text>
          }
          description={
            <div className="game-info">
              {game.jackpot && (
                <div className="jackpot-info">
                  <Text className="jackpot-label">Jackpot:</Text>
                  <Text className="jackpot-amount">
                    {game.jackpot.toLocaleString('vi-VN')}₫
                  </Text>
                </div>
              )}
              {game.rtp && (
                <Text className="rtp-info">RTP: {game.rtp}%</Text>
              )}
              <div className="bet-range">
                <Text className="bet-info">
                  {game.minBet?.toLocaleString('vi-VN')}₫ - {game.maxBet?.toLocaleString('vi-VN')}₫
                </Text>
              </div>
            </div>
          }
        />
      </Card>
    </Col>
  )

  return (
    <UserLayout>
      <div className="game-lobby-container">
        {/* Header */}
        <div className="lobby-header">
          <Title level={2} className="lobby-title">
            <PlayCircleOutlined className="lobby-icon" />
            Game Lobby
          </Title>
          <Text className="lobby-subtitle">
            Khám phá hàng nghìn trò chơi hấp dẫn từ các nhà cung cấp hàng đầu
          </Text>
        </div>

        {/* Filters */}
        <Card className="filters-card">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={8}>
              <Search
                placeholder="Tìm kiếm game..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="game-search"
              />
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Nhà cung cấp"
                size="large"
                value={selectedProvider}
                onChange={setSelectedProvider}
                className="provider-select"
                style={{ width: '100%' }}
              >
                <Option value="all">Tất cả nhà cung cấp</Option>
                {providers.map(provider => (
                  <Option key={provider.id} value={provider.id}>
                    <Space>
                      <img src={provider.logo} alt={provider.name} style={{ width: 20, height: 20 }} />
                      {provider.name} ({provider.gameCount})
                    </Space>
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={12} sm={6} md={4}>
              <Select
                placeholder="Sắp xếp"
                size="large"
                value={sortBy}
                onChange={setSortBy}
                style={{ width: '100%' }}
              >
                <Option value="popular">Phổ biến</Option>
                <Option value="newest">Mới nhất</Option>
                <Option value="jackpot">Jackpot cao</Option>
                <Option value="rtp">RTP cao</Option>
              </Select>
            </Col>
          </Row>
        </Card>

        {/* Category Tabs */}
        <Card className="categories-card">
          <Tabs
            activeKey={selectedCategory}
            onChange={setSelectedCategory}
            size="large"
            className="category-tabs"
          >
            {categories.map(category => (
              <TabPane
                tab={
                  <Space>
                    {category.icon}
                    {category.label}
                    <Badge count={category.count} showZero />
                  </Space>
                }
                key={category.key}
              />
            ))}
          </Tabs>
        </Card>

        {/* Games Grid */}
        <Card className="games-grid-card">
          {loading ? (
            <div className="loading-container">
              <Spin size="large" />
              <Text style={{ marginTop: 16, display: 'block', textAlign: 'center' }}>
                Đang tải games...
              </Text>
            </div>
          ) : filteredGames.length > 0 ? (
            <Row gutter={[16, 16]}>
              {filteredGames.map(renderGameCard)}
            </Row>
          ) : (
            <Empty
              description="Không tìm thấy game nào"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          )}
        </Card>

        {/* Load More Button */}
        {filteredGames.length > 0 && (
          <div className="load-more-container">
            <Button type="primary" size="large" className="load-more-btn">
              Tải thêm games
            </Button>
          </div>
        )}
      </div>
    </UserLayout>
  )
}

export default GameLobby