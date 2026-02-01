import React, { useEffect, useState } from 'react'
import { Card, Table, Typography, message, DatePicker, Select, Space, Tag, Input } from 'antd'
import { SearchOutlined, HistoryOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
import UserLayout from '../layouts/UserLayout'
import './Transactions.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { Option } = Select

interface Transaction {
  id: number
  type: string
  amount: number
  status: string
  description: string
  createdAt: string
  updatedAt: string
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    dateRange: null as any,
    search: ''
  })

  useEffect(() => {
    fetchTransactions()
  }, [filters])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const params = {
        ...filters,
        startDate: filters.dateRange?.[0]?.toISOString(),
        endDate: filters.dateRange?.[1]?.toISOString(),
      }
      delete params.dateRange
      
      const response = await apiClient.get('/transactions', { params })
      setTransactions(response.data || [])
    } catch (error: any) {
      message.error(error.message || 'Lấy danh sách giao dịch thất bại')
    } finally {
      setLoading(false)
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
    if (type === 'transfer') return 'Chuyển Tiền'
    return 'Giao Dịch Khác'
  }

  const getTransactionStatusTag = (status: string) => {
    if (status === 'success') {
      return <Tag color="green">Thành Công</Tag>
    }
    if (status === 'pending') {
      return <Tag color="orange">Đang Xử Lý</Tag>
    }
    if (status === 'failed') {
      return <Tag color="red">Thất Bại</Tag>
    }
    return <Tag color="default">Không Xác Định</Tag>
  }

  const columns = [
    {
      title: 'Loại Giao Dịch',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Space>
          {getTransactionTypeIcon(type)}
          <Text>{getTransactionTypeText(type)}</Text>
        </Space>
      ),
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number, record: Transaction) => (
        <Text 
          className={`transaction-amount ${record.type === 'deposit' ? 'deposit' : 'withdraw'}`}
        >
          {record.type === 'deposit' ? '+' : '-'}{amount.toLocaleString('vi-VN')}₫
        </Text>
      ),
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getTransactionStatusTag(status),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Ngày Cập Nhật',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date: string) => new Date(date).toLocaleString('vi-VN'),
    },
  ]

  return (
    <UserLayout>
      <div className="transactions-container">
        <Title level={3}>Lịch Sử Giao Dịch</Title>
        
        <Card className="filters-card">
          <Space wrap>
            <Select
              placeholder="Loại Giao Dịch"
              style={{ width: 160 }}
              value={filters.type}
              onChange={(value) => setFilters({ ...filters, type: value })}
            >
              <Option value="">Tất Cả</Option>
              <Option value="deposit">Nạp Tiền</Option>
              <Option value="withdraw">Rút Tiền</Option>
              <Option value="transfer">Chuyển Tiền</Option>
            </Select>
            
            <Select
              placeholder="Trạng Thái"
              style={{ width: 160 }}
              value={filters.status}
              onChange={(value) => setFilters({ ...filters, status: value })}
            >
              <Option value="">Tất Cả</Option>
              <Option value="success">Thành Công</Option>
              <Option value="pending">Đang Xử Lý</Option>
              <Option value="failed">Thất Bại</Option>
            </Select>
            
            <RangePicker
              style={{ width: 240 }}
              onChange={(dates) => setFilters({ ...filters, dateRange: dates })}
            />
            
            <Input
              placeholder="Tìm kiếm"
              prefix={<SearchOutlined />}
              style={{ width: 200 }}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </Space>
        </Card>
        
        <Card className="transactions-card">
          <Table
            loading={loading}
            dataSource={transactions}
            columns={columns}
            rowKey="id"
            locale={{ emptyText: 'Không có giao dịch' }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
      </div>
    </UserLayout>
  )
}

export default Transactions