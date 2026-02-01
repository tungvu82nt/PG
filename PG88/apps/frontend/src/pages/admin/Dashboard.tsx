import React, { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Typography, Table, message } from 'antd'
import { UserOutlined, DollarOutlined, HistoryOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { apiClient } from '../../api/client'
import AdminLayout from '../../layouts/AdminLayout'
import './Dashboard.css'

const { Title, Text } = Typography

interface PendingWithdrawal {
  id: number
  userId: number
  username: string
  amount: number
  bankName: string
  accountNumber: string
  accountName: string
  createdAt: string
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingWithdrawals: 0,
  })
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawal[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchStats()
    fetchPendingWithdrawals()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/stats')
      setStats(response.data || stats)
    } catch (error: any) {
      message.error(error.message || 'Lấy dữ liệu thống kê thất bại')
    }
  }

  const fetchPendingWithdrawals = async () => {
    setLoading(true)
    try {
      // API Backend yêu cầu page và limit
      const response = await apiClient.get('/admin/transactions/withdrawals/pending', {
        params: { page: 1, limit: 10 }
      })
      
      // Backend trả về { items: [], meta: {} }
      const items = response.data?.items || []
      
      // Map dữ liệu từ Backend sang format của Table
      const mappedItems = items.map((item: any) => ({
        id: item.id,
        userId: item.user?.id,
        username: item.user?.username || 'Unknown',
        amount: Number(item.amount),
        // Tạm thời chưa có thông tin ngân hàng trong Transaction entity
        // Cần update Backend để lưu thông tin này khi tạo lệnh rút
        bankName: 'N/A', 
        accountNumber: 'N/A',
        accountName: item.user?.realName || 'N/A',
        createdAt: item.createdAt,
      }))

      setPendingWithdrawals(mappedItems)
    } catch (error: any) {
      console.error('Fetch pending withdrawals error:', error)
      message.error(error.message || 'Lấy dữ liệu rút tiền thất bại')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Người Dùng',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => (
        <Text strong>{amount.toLocaleString('vi-VN')}₫</Text>
      ),
    },
    {
      title: 'Ngân Hàng',
      dataIndex: 'bankName',
      key: 'bankName',
    },
    {
      title: 'Số TK',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ]

  return (
    <AdminLayout>
      <div className="admin-dashboard-container">
        <Title level={3}>Dashboard</Title>
        
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Tổng Người Dùng"
                value={stats.totalUsers}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Tổng Nạp (Hôm Nay)"
                value={stats.totalDeposits}
                precision={0}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix="₫"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Tổng Rút (Hôm Nay)"
                value={stats.totalWithdrawals}
                precision={0}
                valueStyle={{ color: '#cf1322' }}
                prefix={<DollarOutlined />}
                suffix="₫"
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="stat-card">
              <Statistic
                title="Rút Chờ Xử Lý"
                value={stats.pendingWithdrawals}
                prefix={<HistoryOutlined />}
              />
            </Card>
          </Col>
        </Row>
        
        <div style={{ marginTop: 24 }}>
          <Card className="pending-withdrawals-card">
            <Title level={4}>Rút Tiền Chờ Xử Lý</Title>
            <Table
              loading={loading}
              dataSource={pendingWithdrawals}
              columns={columns}
              rowKey="id"
              locale={{ emptyText: 'Không có rút tiền chờ xử lý' }}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </div>
      </div>
    </AdminLayout>
  )
}

export default Dashboard