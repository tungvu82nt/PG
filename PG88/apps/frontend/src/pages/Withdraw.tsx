import React, { useEffect, useState } from 'react'
import { Form, Input, Button, Card, Select, Typography, message, Space, Divider, Modal } from 'antd'
import { DollarOutlined, BankOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
import UserLayout from '../layouts/UserLayout'
import RealTimeBalance from '../components/RealTimeBalance/RealTimeBalance'
import TransactionProgress from '../components/TransactionProgress/TransactionProgress'
import { useWebSocketStore } from '../store/websocket.store'
import type { Transaction } from '../components/TransactionProgress/TransactionProgress'
import './Withdraw.css'

const { Title, Text } = Typography
const { Option } = Select

interface BankAccount {
  id: number
  bankName: string
  accountNumber: string
  accountName: string
  branch: string
}

const Withdraw: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [balance, setBalance] = useState(0)
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  
  // WebSocket integration
  const { isConnected } = useWebSocketStore()

  useEffect(() => {
    fetchBankAccounts()
    fetchBalance()
  }, [])

  const fetchBankAccounts = async () => {
    try {
      const response = await apiClient.get('/users/bank-accounts')
      setBankAccounts(response.data || [])
    } catch (error: any) {
      message.error(error.message || 'Lấy danh sách tài khoản thất bại')
    }
  }

  const fetchBalance = async () => {
    try {
      const response = await apiClient.get('/users/balance')
      setBalance(response.data || 0)
    } catch (error: any) {
      message.error(error.message || 'Lấy số dư thất bại')
    }
  }

  const handleSubmit = async (values: any) => {
    if (values.amount > balance) {
      message.error('Số tiền rút vượt quá số dư tài khoản')
      return
    }

    // Calculate withdrawal fee
    const fee = Math.max(values.amount * 0.005, 10000) // 0.5% minimum 10,000 VND
    const totalDeduction = values.amount + fee

    if (totalDeduction > balance) {
      message.error(`Số dư không đủ để thanh toán phí. Cần thêm ${(totalDeduction - balance).toLocaleString('vi-VN')}₫`)
      return
    }

    Modal.confirm({
      title: 'Xác nhận rút tiền',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Số tiền rút: <strong>{values.amount.toLocaleString('vi-VN')}₫</strong></p>
          <p>Phí rút tiền: <strong>{fee.toLocaleString('vi-VN')}₫</strong></p>
          <p>Tổng trừ từ tài khoản: <strong>{totalDeduction.toLocaleString('vi-VN')}₫</strong></p>
          <p style={{ color: '#ffc107' }}>Bạn có chắc chắn muốn thực hiện giao dịch này?</p>
        </div>
      ),
      onOk: async () => {
        setLoading(true)
        try {
          const response = await apiClient.post('/transactions/withdraw', {
            ...values,
            fee: fee
          })
          
          const transaction: Transaction = {
            id: response.data.id || `WD_${Date.now()}`,
            type: 'withdraw',
            amount: values.amount,
            status: 'pending',
            paymentMethod: 'Bank Transfer',
            createdAt: new Date(),
            steps: [
              {
                title: 'Tạo yêu cầu rút tiền',
                description: 'Yêu cầu rút tiền đã được tạo thành công',
                status: 'finish',
                timestamp: new Date()
              },
              {
                title: 'Kiểm tra thông tin',
                description: 'Hệ thống đang kiểm tra thông tin tài khoản',
                status: 'process'
              },
              {
                title: 'Xử lý giao dịch',
                description: 'Đang xử lý chuyển khoản',
                status: 'wait'
              },
              {
                title: 'Hoàn thành',
                description: 'Tiền đã được chuyển vào tài khoản ngân hàng',
                status: 'wait'
              }
            ],
            estimatedTime: 1440 // 24 hours in minutes
          }
          
          setCurrentTransaction(transaction)

          message.success('Yêu cầu rút tiền thành công! Đang chờ xử lý.')
          form.resetFields()
          fetchBalance() // Refresh balance
        } catch (error: any) {
          message.error(error.message || 'Yêu cầu rút tiền thất bại')
        } finally {
          setLoading(false)
        }
      }
    })
  }

  const handleTransactionCancel = (transactionId: string) => {
    Modal.confirm({
      title: 'Xác nhận hủy giao dịch',
      content: 'Bạn có chắc chắn muốn hủy giao dịch này?',
      onOk: async () => {
        try {
          await apiClient.post(`/transactions/${transactionId}/cancel`)
          setCurrentTransaction(null)
          message.success('Đã hủy giao dịch thành công')
          fetchBalance() // Refresh balance
        } catch (error) {
          message.error('Không thể hủy giao dịch')
        }
      }
    })
  }

  const handleTransactionRetry = async (transactionId: string) => {
    try {
      await apiClient.post(`/transactions/${transactionId}/retry`)
      message.success('Đã gửi lại yêu cầu giao dịch')
    } catch (error) {
      message.error('Không thể thử lại giao dịch')
    }
  }

  const calculateFee = (amount: number) => {
    return Math.max(amount * 0.005, 10000)
  }

  const watchedAmount = Form.useWatch('amount', form)
  const estimatedFee = watchedAmount ? calculateFee(watchedAmount) : 0
  const totalDeduction = watchedAmount ? watchedAmount + estimatedFee : 0

  return (
    <UserLayout>
      <div className="withdraw-container">
        <div className="withdraw-header">
          <Title level={3}>Rút Tiền</Title>
          <RealTimeBalance size="large" />
        </div>
        
        {/* Current Transaction Progress */}
        {currentTransaction && (
          <div className="current-transaction">
            <TransactionProgress
              transaction={currentTransaction}
              onCancel={handleTransactionCancel}
              onRetry={handleTransactionRetry}
              className="transaction-card"
            />
          </div>
        )}
        
        <div className="withdraw-content">
          <Card className="balance-overview-card">
            <div className="balance-overview">
              <div className="balance-info">
                <Space size="large" style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="balance-item">
                    <DollarOutlined className="balance-icon" />
                    <div className="balance-details">
                      <Text className="balance-label">Số Dư Hiện Tại</Text>
                      <Text className="balance-amount">{balance.toLocaleString('vi-VN')}₫</Text>
                    </div>
                  </div>
                  <div className="balance-item">
                    <BankOutlined className="balance-icon" />
                    <div className="balance-details">
                      <Text className="balance-label">Có Thể Rút</Text>
                      <Text className="available-amount">{balance.toLocaleString('vi-VN')}₫</Text>
                    </div>
                  </div>
                </Space>
              </div>
            </div>
          </Card>
          
          <Card className="withdraw-form-card">
            <Title level={4}>Thông Tin Rút Tiền</Title>
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="withdraw-form"
            >
              <Form.Item
                name="bankAccountId"
                label="Tài Khoản Ngân Hàng"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản ngân hàng' }]}
              >
                <Select 
                  placeholder="Chọn tài khoản ngân hàng"
                  size="large"
                  className="bank-select"
                >
                  {bankAccounts.map((account) => (
                    <Option key={account.id} value={account.id}>
                      <div className="bank-option">
                        <BankOutlined className="bank-icon" />
                        <div className="bank-info">
                          <Text className="bank-name">{account.bankName}</Text>
                          <Text className="account-number">{account.accountNumber}</Text>
                          <Text className="account-holder">{account.accountName}</Text>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item
                name="amount"
                label="Số Tiền Rút"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền rút' },
                  {
                    validator: (_, value) => {
                      if (value && value <= 0) {
                        return Promise.reject(new Error('Số tiền rút phải lớn hơn 0'))
                      }
                      if (value && value < 100000) {
                        return Promise.reject(new Error('Số tiền rút tối thiểu là 100.000₫'))
                      }
                      if (value && value > balance) {
                        return Promise.reject(new Error('Số tiền rút vượt quá số dư tài khoản'))
                      }
                      const fee = calculateFee(value || 0)
                      if (value && (value + fee) > balance) {
                        return Promise.reject(new Error(`Số dư không đủ để thanh toán phí. Cần thêm ${((value + fee) - balance).toLocaleString('vi-VN')}₫`))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Input
                  prefix={<DollarOutlined />}
                  placeholder="Nhập số tiền rút"
                  type="number"
                  size="large"
                  className="amount-input"
                  min={100000}
                  max={balance}
                />
              </Form.Item>
              
              {/* Quick Amount Buttons */}
              <div className="quick-amounts">
                <Text className="quick-amounts-label">Số tiền nhanh:</Text>
                <Space wrap>
                  {[500000, 1000000, 2000000, 5000000, balance].filter(amount => amount <= balance && amount >= 100000).map(amount => (
                    <Button
                      key={amount}
                      size="small"
                      onClick={() => form.setFieldsValue({ amount })}
                      className="quick-amount-btn"
                    >
                      {amount === balance ? 'Tất cả' : `${amount.toLocaleString('vi-VN')}₫`}
                    </Button>
                  ))}
                </Space>
              </div>
              
              {/* Fee Calculation Display */}
              {watchedAmount && (
                <div className="fee-calculation">
                  <Card className="fee-card">
                    <Title level={5}>Chi Tiết Giao Dịch</Title>
                    <Space size="large" style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
                      <div className="fee-row">
                        <Text className="fee-label">Số tiền rút:</Text>
                        <Text className="fee-value">{watchedAmount.toLocaleString('vi-VN')}₫</Text>
                      </div>
                      <div className="fee-row">
                        <Text className="fee-label">Phí rút tiền (0.5%):</Text>
                        <Text className="fee-value">{estimatedFee.toLocaleString('vi-VN')}₫</Text>
                      </div>
                      <Divider style={{ margin: '8px 0' }} />
                      <div className="fee-row total">
                        <Text className="fee-label total">Tổng trừ từ tài khoản:</Text>
                        <Text className="fee-value total">{totalDeduction.toLocaleString('vi-VN')}₫</Text>
                      </div>
                      <div className="fee-row">
                        <Text className="fee-label">Số dư còn lại:</Text>
                        <Text className={`fee-value ${(balance - totalDeduction) < 0 ? 'insufficient' : ''}`}>
                          {(balance - totalDeduction).toLocaleString('vi-VN')}₫
                        </Text>
                      </div>
                    </Space>
                  </Card>
                </div>
              )}
              
              <Form.Item
                name="description"
                label="Mô Tả (Tùy Chọn)"
              >
                <Input.TextArea
                  placeholder="Nhập mô tả (nếu có)"
                  rows={3}
                  className="description-input"
                />
              </Form.Item>
              
              <div className="withdraw-info">
                <Card className="info-card">
                  <Title level={5}>Lưu Ý Quan Trọng</Title>
                  <Space size="large" style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Text>• Phí rút tiền: 0.5% của số tiền rút (tối thiểu 10.000₫)</Text>
                    <Text>• Thời gian xử lý: 1-3 ngày làm việc</Text>
                    <Text>• Số tiền rút tối thiểu: 100.000₫</Text>
                    <Text>• Chỉ có thể rút vào tài khoản ngân hàng đã xác thực</Text>
                    <Text type="warning">• Vui lòng kiểm tra kỹ thông tin tài khoản trước khi xác nhận</Text>
                  </Space>
                </Card>
              </div>
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="withdraw-submit-button"
                  loading={loading}
                  size="large"
                  block
                  disabled={!watchedAmount || totalDeduction > balance}
                >
                  Xác Nhận Rút Tiền
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </UserLayout>
  )
}

export default Withdraw