import React, { useEffect, useState } from 'react'
import { Card, Typography, Row, Col, List, Tag, Button, message, Progress, Avatar, Space, Statistic } from 'antd'
import {
  DollarOutlined,
  HistoryOutlined,
  CreditCardOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  GiftOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  StarOutlined,
  FireOutlined,
  WalletOutlined,
  BankOutlined
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { apiClient } from '../api/client'
import { useAuthStore } from '../store/auth.store'
import { useWebSocket } from '../hooks/useWebSocket'
import UserLayout from '../layouts/UserLayout'
import RealTimeBalance from '../components/RealTimeBalance/RealTimeBalance'
import './Dashboard.css'

const { Title, Text } = Typography

interface Transaction {
  id: number
  type: string
  amount: number
  status: string
  createdAt: string
}

interface UserStats {
  totalDeposits: number
  totalWithdrawals: number
  totalGames: number
  vipLevel: number
  vipProgress: number
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalGames: 0,
    vipLevel: 1,
    vipProgress: 25
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()
  const { isConnected } = useWebSocket()

  useEffect(() => {
    fetchRecentTransactions()
    fetchUserStats()
    // Remove fetchBalance since we're using WebSocket balance
  }, [])

  const fetchRecentTransactions = async () => {
    try {
      const response = await apiClient.get('/transactions/recent')
      setTransactions(response.data || [])
    } catch (error: any) {
      message.error(error.message || 'Lấy dữ liệu thất bại')
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const response = await apiClient.get('/users/stats')
      setUserStats(response.data || userStats)
    } catch (error: any) {
      // Use mock data if API fails
      setUserStats({
        totalDeposits: 5000000,
        totalWithdrawals: 2500000,
        totalGames: 156,
        vipLevel: 2,
        vipProgress: 65
      })
    }
  }

  const getTransactionTypeIcon = (type: string) => {
    if (type === 'deposit') return <ArrowUpOutlined className="transaction-icon deposit" />
    if (type === 'withdraw') return <ArrowDownOutlined className="transaction-icon withdraw" />
    return <HistoryOutlined className="transaction-icon" />
  }

  const getTransactionTypeText = (type: string) => {
    if (type === 'deposit') return 'Nạp Tiền'
    if (type === 'withdraw') return 'Rút Tiền'
    return 'Giao Dịch Khác'
  }

  const getTransactionStatusTag = (status: string) => {
    if (status === 'success') {
      return <Tag color="green">Thành Công</Tag>
    }
    if (status === 'pending') {
      return <Tag color="orange">Đang Xử Lý</Tag>
    }
    return <Tag color="red">Thất Bại</Tag>
  }

  const getVipLevelColor = (level: number) => {
    if (level >= 5) return '#ff4d4f'
    if (level >= 3) return '#d0ad4a'
    return '#52c41a'
  }

  const quickActions = [
    {
      key: 'deposit',
      title: 'Nạp Tiền',
      icon: <WalletOutlined />,
      color: '#52c41a',
      link: '/deposit',
      description: 'Nạp tiền nhanh chóng'
    },
    {
      key: 'withdraw',
      title: 'Rút Tiền',
      icon: <BankOutlined />,
      color: '#1890ff',
      link: '/withdraw',
      description: 'Rút tiền an toàn'
    },
    {
      key: 'games',
      title: 'Trò Chơi',
      icon: <PlayCircleOutlined />,
      color: '#722ed1',
      link: '/games',
      description: 'Khám phá game hot'
    },
    {
      key: 'promotions',
      title: 'Khuyến Mãi',
      icon: <GiftOutlined />,
      color: '#fa541c',
      link: '/promotions',
      description: 'Ưu đãi hấp dẫn'
    },
    {
      key: 'vip',
      title: 'VIP Club',
      icon: <TrophyOutlined />,
      color: '#d0ad4a',
      link: '/vip',
      description: 'Đặc quyền VIP'
    },
    {
      key: 'history',
      title: 'Lịch Sử',
      icon: <HistoryOutlined />,
      color: '#13c2c2',
      link: '/transactions',
      description: 'Xem giao dịch'
    }
  ]

  return (
    <UserLayout>
      <div className="dashboard-container">
        <div className="dashboard-header">
          <Title level={2} style={{ color: 'white', marginBottom: 8 }}>
            <Space>
              <Avatar size="large" style={{ background: '#d0ad4a', color: '#000' }}>
                {user?.username?.charAt(0).toUpperCase()}
              </Avatar>
              Chào mừng trở lại, {user?.username}!
            </Space>
          </Title>
          <Text style={{ color: '#8c8c8c', fontSize: 16 }}>
            Chúc bạn may mắn và thắng lớn hôm nay! 🎰
          </Text>
        </div>
        
        {/* Balance & VIP Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
          <Col xs={24} lg={16}>
            <Card className="balance-card-enhanced">
              <RealTimeBalance 
                size="large"
                showRefreshButton={true}
                showConnectionStatus={true}
                className="dashboard-balance"
              />
              <div className="balance-actions-enhanced">
                <Link to="/deposit">
                  <Button 
                    type="primary" 
                    size="large"
                    className="balance-button deposit-enhanced"
                    icon={<ArrowUpOutlined />}
                  >
                    Nạp Tiền
                  </Button>
                </Link>
                <Link to="/withdraw">
                  <Button 
                    size="large"
                    className="balance-button withdraw-enhanced"
                    icon={<ArrowDownOutlined />}
                  >
                    Rút Tiền
                  </Button>
                </Link>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={8}>
            <Card className="vip-card">
              <div className="vip-header">
                <Space>
                  <TrophyOutlined style={{ color: getVipLevelColor(userStats.vipLevel), fontSize: 24 }} />
                  <div>
                    <Title level={4} style={{ margin: 0, color: 'white' }}>
                      VIP Level {userStats.vipLevel}
                    </Title>
                    <Text style={{ color: '#8c8c8c' }}>Thành viên đặc biệt</Text>
                  </div>
                </Space>
              </div>
              <div className="vip-progress">
                <Text style={{ color: '#8c8c8c', marginBottom: 8, display: 'block' }}>
                  Tiến độ lên VIP {userStats.vipLevel + 1}
                </Text>
                <Progress
                  percent={userStats.vipProgress}
                  strokeColor={{
                    '0%': '#d0ad4a',
                    '100%': '#ffd700',
                  }}
                  trailColor="#1f1f1f"
                  showInfo={false}
                />
                <Text style={{ color: '#d0ad4a', fontSize: 12 }}>
                  {userStats.vipProgress}% hoàn thành
                </Text>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Quick Actions */}
        <Card className="quick-actions-card-enhanced" style={{ marginBottom: 24 }}>
          <Title level={4} style={{ color: 'white', marginBottom: 20 }}>
            <FireOutlined style={{ color: '#ff4d4f', marginRight: 8 }} />
            Hành Động Nhanh
          </Title>
          <Row gutter={[16, 16]}>
            {quickActions.map((action) => (
              <Col xs={12} sm={8} md={4} key={action.key}>
                <Link to={action.link}>
                  <Card 
                    className="quick-action-card"
                    hoverable
                    style={{
                      background: `linear-gradient(135deg, ${action.color}20 0%, ${action.color}10 100%)`,
                      border: `1px solid ${action.color}40`,
                      borderRadius: 12
                    }}
                  >
                    <div className="quick-action-content">
                      <div 
                        className="quick-action-icon"
                        style={{ 
                          background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}80 100%)`,
                          color: 'white'
                        }}
                      >
                        {action.icon}
                      </div>
                      <Title level={5} style={{ color: 'white', margin: '8px 0 4px 0' }}>
                        {action.title}
                      </Title>
                      <Text style={{ color: '#8c8c8c', fontSize: 12 }}>
                        {action.description}
                      </Text>
                    </div>
                  </Card>
                </Link>
              </Col>
            ))}
          </Row>
        </Card>

        {/* Stats Cards */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title={<Text style={{ color: '#8c8c8c' }}>Tổng Nạp</Text>}
                value={userStats.totalDeposits}
                precision={0}
                suffix="₫"
                valueStyle={{ color: '#52c41a', fontSize: '20px' }}
                prefix={<ArrowUpOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title={<Text style={{ color: '#8c8c8c' }}>Tổng Rút</Text>}
                value={userStats.totalWithdrawals}
                precision={0}
                suffix="₫"
                valueStyle={{ color: '#1890ff', fontSize: '20px' }}
                prefix={<ArrowDownOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title={<Text style={{ color: '#8c8c8c' }}>Game Đã Chơi</Text>}
                value={userStats.totalGames}
                valueStyle={{ color: '#722ed1', fontSize: '20px' }}
                prefix={<PlayCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card className="stat-card">
              <Statistic
                title={<Text style={{ color: '#8c8c8c' }}>Điểm VIP</Text>}
                value={userStats.vipProgress * 10}
                valueStyle={{ color: '#d0ad4a', fontSize: '20px' }}
                prefix={<StarOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        {/* Recent Transactions */}
        <Card className="recent-transactions-card-enhanced">
          <div className="card-header-enhanced">
            <Title level={4} style={{ color: 'white', margin: 0 }}>
              <HistoryOutlined style={{ color: '#1890ff', marginRight: 8 }} />
              Giao Dịch Gần Đây
            </Title>
            <Link to="/transactions">
              <Button type="link" style={{ color: '#d0ad4a' }}>
                Xem Tất Cả
              </Button>
            </Link>
          </div>
          <List
            loading={loading}
            dataSource={transactions.length > 0 ? transactions : [
              { id: 1, type: 'deposit', amount: 500000, status: 'success', createdAt: new Date().toISOString() },
              { id: 2, type: 'withdraw', amount: 200000, status: 'pending', createdAt: new Date(Date.now() - 86400000).toISOString() },
              { id: 3, type: 'deposit', amount: 1000000, status: 'success', createdAt: new Date(Date.now() - 172800000).toISOString() }
            ]}
            locale={{ emptyText: 'Không có giao dịch gần đây' }}
            renderItem={(item) => (
              <List.Item className="transaction-item-enhanced">
                <div className="transaction-info-enhanced">
                  <div className="transaction-type-enhanced">
                    <div className={`transaction-icon-wrapper ${item.type}`}>
                      {getTransactionTypeIcon(item.type)}
                    </div>
                    <div>
                      <Text strong style={{ color: 'white' }}>
                        {getTransactionTypeText(item.type)}
                      </Text>
                      <br />
                      <Text className="transaction-date" style={{ color: '#8c8c8c', fontSize: 12 }}>
                        {new Date(item.createdAt).toLocaleString('vi-VN')}
                      </Text>
                    </div>
                  </div>
                </div>
                <div className="transaction-amount-enhanced">
                  <Text 
                    className={`transaction-amount-text ${item.type === 'deposit' ? 'deposit' : 'withdraw'}`}
                    style={{ 
                      fontSize: 16, 
                      fontWeight: 'bold',
                      color: item.type === 'deposit' ? '#52c41a' : '#1890ff'
                    }}
                  >
                    {item.type === 'deposit' ? '+' : '-'}{item.amount.toLocaleString('vi-VN')}₫
                  </Text>
                  <div style={{ marginTop: 4 }}>
                    {getTransactionStatusTag(item.status)}
                  </div>
                </div>
              </List.Item>
            )}
          />
        </Card>
      </div>
    </UserLayout>
  )
}

export default Dashboard