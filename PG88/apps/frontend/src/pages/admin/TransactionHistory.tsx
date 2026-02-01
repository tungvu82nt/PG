import React, { useEffect, useState } from 'react'
import { Table, Tag, message, Card, Input, Select, Typography } from 'antd'
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table'
import { apiClient } from '../../api/client'
import AdminLayout from '../../layouts/AdminLayout'
import './TransactionHistory.css'

const { Title, Text } = Typography
const { Option } = Select

interface TransactionDataType {
  id: number
  type: string
  amount: number
  status: string
  createdAt: string
  user: {
      username: string
  }
  auditId: string
}

const TransactionHistory: React.FC = () => {
  const [data, setData] = useState<TransactionDataType[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [searchUsername, setSearchUsername] = useState('')
  const [filterType, setFilterType] = useState<string | undefined>(undefined)
  const [filterStatus, setFilterStatus] = useState<string | undefined>(undefined)

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = { page, limit: pageSize }
      if (searchUsername) params.username = searchUsername
      if (filterType) params.type = filterType
      if (filterStatus) params.status = filterStatus
      
      const response = await apiClient.get('/admin/transactions', { params })
      const { items, meta } = response
      
      setData(items)
      setPagination({
        current: Number(meta.currentPage),
        pageSize: Number(meta.itemsPerPage),
        total: Number(meta.totalItems),
      })
    } catch (error: any) {
      message.error(error.message || 'Lấy danh sách giao dịch thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize)
  }, [pagination.current, pagination.pageSize, searchUsername, filterType, filterStatus])

  const handleTableChange = (newPagination: TablePaginationConfig) => {
    setPagination({
        current: newPagination.current || 1,
        pageSize: newPagination.pageSize || 10,
        total: newPagination.total || 0,
    })
  }

  const columns: ColumnsType<TransactionDataType> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
        title: 'Người Dùng',
        dataIndex: ['user', 'username'],
        key: 'username',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
          let color = 'default'
          if (type === 'DEPOSIT') color = 'green'
          else if (type === 'WITHDRAW') color = 'orange'
          else if (type === 'BET') color = 'blue'
          else if (type === 'WIN') color = 'gold'
          return <Tag color={color}>{type}</Tag>
      }
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (val, record) => {
          const color = record.type === 'DEPOSIT' || record.type === 'WIN' ? 'green' : 'red'
          return <Text style={{ color }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}
          </Text>
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
          <Tag color={status === 'SUCCESS' ? 'success' : status === 'PENDING' ? 'warning' : 'error'}>{status}</Tag>
      ),
    },
    {
      title: 'Thời Gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
        title: 'Audit ID',
        dataIndex: 'auditId',
        key: 'auditId',
        ellipsis: true,
    }
  ]

  return (
    <AdminLayout>
      <div className="admin-transaction-history-container">
        <Title level={3}>Lịch Sử Giao Dịch</Title>
        
        <Card className="transaction-filters-card">
          <div className="transaction-filters">
            <Input 
                placeholder="Tìm kiếm tên người dùng" 
                style={{ width: 250 }} 
                value={searchUsername}
                onChange={e => {
                    setSearchUsername(e.target.value)
                    setPagination(prev => ({ ...prev, current: 1 }))
                }}
            />
            <Select 
                placeholder="Loại Giao Dịch" 
                allowClear 
                style={{ width: 180 }}
                onChange={val => {
                    setFilterType(val)
                    setPagination(prev => ({ ...prev, current: 1 }))
                }}
            >
                <Option value="DEPOSIT">Nạp Tiền</Option>
                <Option value="WITHDRAW">Rút Tiền</Option>
                <Option value="BET">Cược</Option>
                <Option value="WIN">Thắng</Option>
                <Option value="ADJUSTMENT">Cập Nhật</Option>
            </Select>
            <Select 
                placeholder="Trạng Thái" 
                allowClear 
                style={{ width: 180 }}
                onChange={val => {
                    setFilterStatus(val)
                    setPagination(prev => ({ ...prev, current: 1 }))
                }}
            >
                <Option value="SUCCESS">Thành Công</Option>
                <Option value="PENDING">Đang Xử Lý</Option>
                <Option value="FAILED">Thất Bại</Option>
                <Option value="REJECTED">Từ Chối</Option>
            </Select>
          </div>
        </Card>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          className="transaction-history-table"
        />
      </div>
    </AdminLayout>
  )
}

export default TransactionHistory