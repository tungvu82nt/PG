import React, { useEffect, useState } from 'react'
import { Table, Space, Button, Tag, message, Modal, Input, Typography } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { CheckOutlined, CloseOutlined } from '@ant-design/icons'
import { apiClient } from '../../api/client'
import AdminLayout from '../../layouts/AdminLayout'
import './Transactions.css'

const { Title, Text } = Typography

interface WithdrawalType {
  id: number
  userId: number
  user: { username: string; balance: number }
  amount: number
  status: string
  createdAt: string
  auditId: string
}

const Transactions: React.FC = () => {
  const [data, setData] = useState<WithdrawalType[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  
  // Review Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [currentTx, setCurrentTx] = useState<WithdrawalType | null>(null)
  const [reason, setReason] = useState('')

  const fetchData = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      const params = { page, limit: pageSize }
      const response = await apiClient.get('/admin/transactions/withdrawals/pending', { params })
      const { items, meta } = response
      
      setData(items)
      setPagination({
        current: Number(meta.currentPage),
        pageSize: Number(meta.itemsPerPage),
        total: Number(meta.totalItems),
      })
    } catch (error: any) {
      console.error(error)
      message.error(error.message || 'Lấy danh sách rút tiền thất bại')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(pagination.current, pagination.pageSize)
  }, [pagination.current, pagination.pageSize])

  const handleReview = async (action: 'APPROVE' | 'REJECT') => {
      if (!currentTx) return
      try {
          await apiClient.post(`/admin/transactions/withdrawals/${currentTx.id}/review`, {
              action,
              reason: reason || undefined
          })
          message.success(`Rút tiền đã được ${action === 'APPROVE' ? 'duyệt' : 'từ chối'}`)
          setReviewModalOpen(false)
          setReason('')
          fetchData(pagination.current, pagination.pageSize)
      } catch (error: any) {
          message.error(error.message || 'Xử lý rút tiền thất bại')
      }
  }

  const columns: ColumnsType<WithdrawalType> = [
    {
      title: 'Người Dùng',
      dataIndex: ['user', 'username'],
      key: 'username',
      render: (text, record) => record.user?.username || 'Unknown',
    },
    {
      title: 'Số Tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val),
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => <Tag color="orange">{status}</Tag>,
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space>
            <Button 
                type="primary" 
                size="small" 
                icon={<CheckOutlined />}
                onClick={() => {
                    setCurrentTx(record)
                    setReviewModalOpen(true)
                }}
            >
                Xét Duyệt
            </Button>
        </Space>
      ),
    },
  ]

  return (
    <AdminLayout>
      <div className="admin-transactions-container">
        <Title level={3}>Xét Duyệt Rút Tiền</Title>
        
        <Table 
          columns={columns} 
          dataSource={data} 
          rowKey="id" 
          pagination={pagination}
          loading={loading}
          onChange={(p) => setPagination(p as any)}
          className="transactions-table"
        />

        <Modal
          title={`Xét Duyệt Rút Tiền - ${currentTx?.user?.username} - ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(currentTx?.amount || 0)}`}
          open={reviewModalOpen}
          onCancel={() => setReviewModalOpen(false)}
          footer={[
              <Button key="reject" danger icon={<CloseOutlined />} onClick={() => handleReview('REJECT')}>
                Từ Chối
              </Button>,
              <Button key="approve" type="primary" icon={<CheckOutlined />} onClick={() => handleReview('APPROVE')}>
                Duyệt
              </Button>,
          ]}
        >
          <Text>Mô Tả (Tùy Chọn)</Text>
          <Input.TextArea 
            placeholder="Nhập lý do (nếu cần)" 
            value={reason} 
            onChange={(e) => setReason(e.target.value)} 
            rows={4}
            style={{ marginTop: 8 }}
          />
        </Modal>
      </div>
    </AdminLayout>
  )
}

export default Transactions