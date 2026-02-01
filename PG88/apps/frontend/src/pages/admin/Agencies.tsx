import React, { useEffect, useState } from 'react'
import { Table, Tag, message, Card, Input, Button, Modal, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { UsergroupAddOutlined, EyeOutlined, TeamOutlined } from '@ant-design/icons'
import { apiClient } from '../../api/client'
import AdminLayout from '../../layouts/AdminLayout'
import './Agencies.css'

const { Title, Text } = Typography

interface AgencyDataType {
  id: number
  username: string
  role: string
  status: string
  balance: number
  memberCount: number
  createdAt: string
}

interface MemberDataType {
  id: number
  username: string
  balance: number
  status: string
  createdAt: string
}

const Agencies: React.FC = () => {
  const [data, setData] = useState<AgencyDataType[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [search, setSearch] = useState('')

  // Members Modal State
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false)
  const [selectedAgency, setSelectedAgency] = useState<AgencyDataType | null>(null)
  const [membersData, setMembersData] = useState<MemberDataType[]>([])
  const [membersLoading, setMembersLoading] = useState(false)

  const fetchData = async (page = 1, pageSize = 10, searchTerm = '') => {
    setLoading(true)
    try {
      const params: any = { page, limit: pageSize }
      if (searchTerm) params.search = searchTerm
      
      const response = await apiClient.get('/admin/agencies', { params })
      const { items, meta } = response
      
      setData(items)
      setPagination({
        current: Number(meta.currentPage),
        pageSize: Number(meta.itemsPerPage),
        total: Number(meta.totalItems),
      })
    } catch (error: any) {
      message.error(error.message || 'Lấy danh sách đại lý thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, search)
  }, [pagination.current, pagination.pageSize, search])

  const fetchMembers = async (agencyId: number) => {
      setMembersLoading(true)
      try {
          // Re-use admin users endpoint with referrerId filter
          const res = await apiClient.get('/admin/users', { 
              params: { referrerId: agencyId, limit: 100 } 
          })
          setMembersData(res.items)
      } catch (error: any) {
          message.error(error.message || 'Lấy danh sách thành viên thất bại')
      } finally {
          setMembersLoading(false)
      }
  }

  const handleViewMembers = (record: AgencyDataType) => {
      setSelectedAgency(record)
      setIsMembersModalOpen(true)
      fetchMembers(record.id)
  }

  const handleSearch = (value: string) => {
    setSearch(value)
    setPagination(prev => ({ ...prev, current: 1 })) // Reset to first page
  }

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination)
  }

  const columns: ColumnsType<AgencyDataType> = [
    {
      title: 'Tên Đại Lý',
      dataIndex: 'username',
      key: 'username',
      render: (username) => (
        <Text strong>{username}</Text>
      ),
    },
    {
      title: 'Số Thành Viên',
      dataIndex: 'memberCount',
      key: 'memberCount',
      render: (count) => (
        <Tag color="blue" icon={<UsergroupAddOutlined />}>
          {count}
        </Tag>
      ),
      sorter: (a, b) => a.memberCount - b.memberCount,
    },
    {
      title: 'Số Dư',
      dataIndex: 'balance',
      key: 'balance',
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
        title: 'Hành Động',
        key: 'action',
        render: (_, record) => (
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => handleViewMembers(record)}
            >
              Xem Thành Viên
            </Button>
        )
    }
  ]

  const memberColumns = [
      { 
        title: 'Tên Người Dùng', 
        dataIndex: 'username', 
        key: 'username',
        render: (username) => <Text>{username}</Text>,
      },
      { 
        title: 'Số Dư', 
        dataIndex: 'balance', 
        key: 'balance', 
        render: (val: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)
      },
      { 
        title: 'Trạng Thái', 
        dataIndex: 'status', 
        key: 'status',
        render: (status) => <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>,
      },
      { 
        title: 'Ngày Tham Gia', 
        dataIndex: 'createdAt', 
        key: 'createdAt', 
        render: (d: string) => new Date(d).toLocaleDateString('vi-VN')
      },
  ]

  return (
    <AdminLayout>
      <div className="admin-agencies-container">
        <Title level={3}>Quản lý Đại Lý</Title>
        
        <Card 
          className="agencies-card"
          title={
            <Space>
              <TeamOutlined />
              <Text>Quản lý Đại Lý</Text>
            </Space>
          }
          extra={
            <Input.Search 
              placeholder="Tìm kiếm đại lý..." 
              onSearch={handleSearch} 
              style={{ width: 300 }} 
              allowClear
            />
          }
        >
          <Table 
            columns={columns} 
            dataSource={data} 
            rowKey="id" 
            pagination={pagination}
            loading={loading}
            onChange={handleTableChange}
            className="agencies-table"
          />
        </Card>

        <Modal 
          title={`Thành Viên của ${selectedAgency?.username || 'Đại Lý'}`}
          open={isMembersModalOpen}
          onCancel={() => setIsMembersModalOpen(false)}
          width={800}
          footer={null}
        >
          <Table 
            dataSource={membersData} 
            columns={memberColumns} 
            rowKey="id"
            loading={membersLoading}
            pagination={{ pageSize: 5 }}
          />
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Agencies