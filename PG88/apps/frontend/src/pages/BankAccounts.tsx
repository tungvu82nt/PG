import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Table, Typography, message, Modal, Space, Tag } from 'antd'
import { PlusOutlined, EditOutlined, DeleteOutlined, BankOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
import UserLayout from '../layouts/UserLayout'
import './BankAccounts.css'

const { Title, Text } = Typography

interface BankAccount {
  id: number
  bankName: string
  accountNumber: string
  accountName: string
  branch: string
  status: string
}

const BankAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<BankAccount[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null)
  const [form] = Form.useForm()

  useEffect(() => {
    fetchBankAccounts()
  }, [])

  const fetchBankAccounts = async () => {
    setLoading(true)
    try {
      const response = await apiClient.get('/users/bank-accounts')
      setAccounts(response.data || [])
    } catch (error: any) {
      message.error(error.message || 'Lấy danh sách tài khoản thất bại')
    } finally {
      setLoading(false)
    }
  }

  const handleAddAccount = () => {
    setEditingAccount(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleEditAccount = (account: BankAccount) => {
    setEditingAccount(account)
    form.setFieldsValue(account)
    setModalVisible(true)
  }

  const handleDeleteAccount = (id: number) => {
    Modal.confirm({
      title: 'Xác nhận',
      content: 'Bạn có chắc chắn muốn xóa tài khoản này?',
      onOk: async () => {
        try {
          await apiClient.delete(`/users/bank-accounts/${id}`)
          message.success('Xóa tài khoản thành công!')
          fetchBankAccounts()
        } catch (error: any) {
          message.error(error.message || 'Xóa tài khoản thất bại')
        }
      },
    })
  }

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      if (editingAccount) {
        await apiClient.put(`/users/bank-accounts/${editingAccount.id}`, values)
        message.success('Cập nhật tài khoản thành công!')
      } else {
        await apiClient.post('/users/bank-accounts', values)
        message.success('Thêm tài khoản thành công!')
      }
      setModalVisible(false)
      fetchBankAccounts()
    } catch (error: any) {
      message.error(error.message || 'Thao tác thất bại')
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Tên Ngân Hàng',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (text: string) => (
        <Space>
          <BankOutlined />
          <Text>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'Số Tài Khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: 'Chủ Tài Khoản',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Chi Nhánh',
      dataIndex: 'branch',
      key: 'branch',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
        </Tag>
      ),
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_: any, record: BankAccount) => (
        <Space size="middle">
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditAccount(record)}
          >
            Sửa
          </Button>
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteAccount(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <UserLayout>
      <div className="bank-accounts-container">
        <div className="page-header">
          <Title level={3}>Tài Khoản Ngân Hàng</Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddAccount}
            className="add-account-button"
          >
            Thêm Tài Khoản
          </Button>
        </div>
        
        <Card className="bank-accounts-card">
          <Table
            loading={loading}
            dataSource={accounts}
            columns={columns}
            rowKey="id"
            locale={{ emptyText: 'Không có tài khoản ngân hàng' }}
            pagination={{ pageSize: 10 }}
          />
        </Card>
        
        <Modal
          title={editingAccount ? 'Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
        >
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              name="bankName"
              label="Tên Ngân Hàng"
              rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng' }]}
            >
              <Input placeholder="Nhập tên ngân hàng" />
            </Form.Item>
            
            <Form.Item
              name="accountNumber"
              label="Số Tài Khoản"
              rules={[{ required: true, message: 'Vui lòng nhập số tài khoản' }]}
            >
              <Input placeholder="Nhập số tài khoản" />
            </Form.Item>
            
            <Form.Item
              name="accountName"
              label="Chủ Tài Khoản"
              rules={[{ required: true, message: 'Vui lòng nhập chủ tài khoản' }]}
            >
              <Input placeholder="Nhập chủ tài khoản" />
            </Form.Item>
            
            <Form.Item
              name="branch"
              label="Chi Nhánh"
              rules={[{ required: true, message: 'Vui lòng nhập chi nhánh' }]}
            >
              <Input placeholder="Nhập chi nhánh" />
            </Form.Item>
            
            <Form.Item>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button onClick={() => setModalVisible(false)}>
                  Hủy
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                >
                  {editingAccount ? 'Cập Nhật' : 'Thêm'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </UserLayout>
  )
}

export default BankAccounts