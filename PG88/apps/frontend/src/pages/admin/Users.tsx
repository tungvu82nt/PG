import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Input, Select, Tag, Modal, Form, InputNumber, message, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { EditOutlined, DollarOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { apiClient } from '../../api/client'
import AdminLayout from '../../layouts/AdminLayout'
import './Users.css'

const { Option } = Select
const { Title, Text } = Typography

interface UserDataType {
  id: number
  username: string
  email: string | null
  phone: string | null
  role: string
  status: string
  balance: number
  createdAt: string
}

const Users: React.FC = () => {
  const [data, setData] = useState<UserDataType[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  
  // Modal states
  const [balanceModalOpen, setBalanceModalOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [balanceForm] = Form.useForm()

  const fetchData = async (page = 1, pageSize = 10, searchQuery = '', status = '') => {
    setLoading(true)
    try {
      const params: any = { page, limit: pageSize }
      if (searchQuery) params.search = searchQuery
      if (status) params.status = status

      const response = await apiClient.get('/admin/users', { params })
      const { items, meta } = response
      
      setData(items)
      setPagination({
        current: Number(meta.currentPage),
        pageSize: Number(meta.itemsPerPage),
        total: Number(meta.totalItems),
      })
    } catch (error: any) {
      message.error(error.message || 'Lấy danh sách người dùng thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize, search, statusFilter)
  }, [pagination.current, pagination.pageSize, search, statusFilter])

  const handleTableChange = (newPagination: any) => {
    setPagination(newPagination)
  }

  const handleStatusChange = async (record: UserDataType) => {
      const newStatus = record.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
      try {
          await apiClient.patch(`/admin/users/${record.id}/status`, { status: newStatus })
          message.success('Cập nhật trạng thái thành công!')
          fetchData(pagination.current, pagination.pageSize, search, statusFilter)
      } catch (error: any) {
          message.error(error.message || 'Cập nhật trạng thái thất bại')
      }
  }

  const handleAdjustBalance = async (values: any) => {
      if (!currentUserId) return
      try {
          await apiClient.post(`/admin/users/${currentUserId}/adjust-balance`, values)
          message.success('Cập nhật số dư thành công!')
          setBalanceModalOpen(false)
          balanceForm.resetFields()
          fetchData(pagination.current, pagination.pageSize, search, statusFilter)
      } catch (error: any) {
          message.error(error.message || 'Cập nhật số dư thất bại')
      }
  }

  const columns: ColumnsType<UserDataType> = [
    {
      title: 'Tên Đăng Nhập',
      dataIndex: 'username',
      key: 'username',
      render: (username) => (
        <Space>
          <UserOutlined />
          <Text>{username}</Text>
        </Space>
      ),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => <Tag color={role === 'admin' ? 'red' : 'blue'}>{role.toUpperCase()}</Tag>,
    },
    {
      title: 'Số Dư',
      dataIndex: 'balance',
      key: 'balance',
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
          <Tag color={status === 'ACTIVE' ? 'green' : 'red'}>{status}</Tag>
      ),
    },
    {
      title: 'Đăng Ký',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN'),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            size="small" 
            onClick={() => handleStatusChange(record)}
            danger={record.status === 'ACTIVE'}
            type={record.status === 'ACTIVE' ? 'default' : 'primary'}
          >
            {record.status === 'ACTIVE' ? 'Khóa' : 'Mở Khóa'}
          </Button>
          <Button 
            size="small" 
            icon={<DollarOutlined />} 
            onClick={() => {
                setCurrentUserId(record.id)
                setBalanceModalOpen(true)
            }} 
          >
            Cập Nhật Số Dư
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="admin-users-container">
        <Title level={3}>Quản lý Người Dùng</Title>
        
        <div className="users-filters">
          <Input 
              placeholder="Tìm kiếm tên đăng nhập/số điện thoại..." 
              prefix={<SearchOutlined />} 
              style={{ width: 250 }} 
              value={search}
              onChange={e => setSearch(e.target.value)}
          />
          <Select 
              allowClear 
              placeholder="Trạng Thái" 
              style={{ width: 150 }}
              onChange={setStatusFilter}
          >
              <Option value="ACTIVE">Hoạt động</Option>
              <Option value="INACTIVE">Không hoạt động</Option>
          </Select>
        </div>

        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          pagination={pagination}
          loading={loading}
          onChange={handleTableChange}
          className="users-table"
        />

        <Modal
          title="Cập Nhật Số Dư"
          open={balanceModalOpen}
          onCancel={() => setBalanceModalOpen(false)}
          footer={null}
        >
            <Form form={balanceForm} onFinish={handleAdjustBalance} layout="vertical">
                <Form.Item name="type" label="Loại" initialValue="DEPOSIT">
                    <Select>
                        <Option value="DEPOSIT">Nạp Tiền</Option>
                        <Option value="WITHDRAW">Rút Tiền</Option>
                    </Select>
                </Form.Item>
                <Form.Item name="amount" label="Số Tiền" rules={[{ required: true, message: 'Vui lòng nhập số tiền' }]}>
                    <InputNumber style={{ width: '100%' }} min={0} placeholder="Nhập số tiền" />
                </Form.Item>
                <Form.Item name="reason" label="Lý Do">
                    <Input.TextArea placeholder="Nhập lý do" />
                </Form.Item>
                <Form.Item>
                    <Button type="primary" htmlType="submit" block>Xác Nhận</Button>
                </Form.Item>
            </Form>
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Users