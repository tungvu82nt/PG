import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Card, Typography, message, Space, Divider, Modal, QRCode, Spin } from 'antd'
import { DollarOutlined, CreditCardOutlined, BankOutlined, MobileOutlined, CopyOutlined } from '@ant-design/icons'
import { apiClient } from '../api/client'
import UserLayout from '../layouts/UserLayout'
import PaymentMethodCard from '../components/PaymentMethodCard/PaymentMethodCard'
import TransactionProgress from '../components/TransactionProgress/TransactionProgress'
import RealTimeBalance from '../components/RealTimeBalance/RealTimeBalance'
import { useWebSocketStore } from '../store/websocket.store'
import type { Transaction } from '../components/TransactionProgress/TransactionProgress'
import './Deposit.css'

const { Title, Text } = Typography

interface PaymentMethod {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  minimum: number
  maximum: number
  processingTime: string
  fee?: string
  isPopular?: boolean
  isInstant?: boolean
  features?: string[]
}

interface BankInfo {
  bankName: string
  accountNumber: string
  accountName: string
  qrCode?: string
}

const Deposit: React.FC = () => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [selectedMethod, setSelectedMethod] = useState('bank')
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  
  // WebSocket integration
  const { isConnected } = useWebSocketStore()

  const getSelectedMethodInfo = () => {
    return paymentMethods.find(m => m.id === selectedMethod)
  }

  useEffect(() => {
    // Initialize or fetch payment methods if needed
  }, [])

  const paymentMethods: PaymentMethod[] = [
    {
      id: 'bank',
      name: 'Chuyển Khoản Ngân Hàng',
      icon: <BankOutlined />,
      description: 'Chuyển khoản qua Internet Banking hoặc Mobile Banking',
      minimum: 100000,
      maximum: 10000000,
      processingTime: '1-5 phút',
      fee: 'Miễn phí',
      isPopular: true,
      features: ['Bảo mật cao', 'Hỗ trợ 24/7', 'Không giới hạn số lần']
    },
    {
      id: 'card',
      name: 'Thẻ Tín Dụng/Thẻ Ghi Nợ',
      icon: <CreditCardOutlined />,
      description: 'Thanh toán qua thẻ Visa, Mastercard, JCB',
      minimum: 50000,
      maximum: 5000000,
      processingTime: 'Ngay lập tức',
      fee: '1.5%',
      isInstant: true,
      features: ['Tức thì', 'Hỗ trợ quốc tế', 'Bảo mật SSL']
    },
    {
      id: 'mobile',
      name: 'Ví Điện Tử',
      icon: <MobileOutlined />,
      description: 'Thanh toán qua MoMo, ZaloPay, VNPay',
      minimum: 20000,
      maximum: 2000000,
      processingTime: 'Ngay lập tức',
      fee: 'Miễn phí',
      isInstant: true,
      isPopular: true,
      features: ['Tức thì', 'Tiện lợi', 'Ưu đãi thường xuyên']
    },
    {
      id: 'usdt',
      name: 'USDT (Cryptocurrency)',
      icon: <DollarOutlined />,
      description: 'Thanh toán bằng USDT qua mạng TRC20/ERC20',
      minimum: 50000,
      maximum: 50000000,
      processingTime: '5-15 phút',
      fee: 'Phí mạng',
      features: ['Ẩn danh', 'Không giới hạn', 'Phí thấp']
    },
  ]

  const handleSubmit = async (values: any) => {
    setLoading(true)
    try {
      const response = await apiClient.post('/transactions/deposit', {
        ...values,
        paymentMethod: selectedMethod,
      })
      
      const transaction: Transaction = {
        id: response.data.id || `DEP_${Date.now()}`,
        type: 'deposit',
        amount: values.amount,
        status: 'pending',
        paymentMethod: getSelectedMethodInfo()?.name,
        createdAt: new Date(),
        steps: [
          {
            title: 'Tạo yêu cầu nạp tiền',
            description: 'Yêu cầu nạp tiền đã được tạo thành công',
            status: 'finish',
            timestamp: new Date()
          },
          {
            title: 'Chờ thanh toán',
            description: 'Đang chờ bạn thực hiện thanh toán',
            status: 'process'
          },
          {
            title: 'Xác nhận thanh toán',
            description: 'Hệ thống đang xác nhận giao dịch',
            status: 'wait'
          },
          {
            title: 'Hoàn thành',
            description: 'Tiền đã được cộng vào tài khoản',
            status: 'wait'
          }
        ],
        estimatedTime: selectedMethod === 'bank' ? 5 : 1
      }
      
      setCurrentTransaction(transaction)

      message.success('Yêu cầu nạp tiền thành công! Vui lòng thực hiện thanh toán.')
      form.resetFields()
    } catch (error: any) {
      message.error(error.message || 'Yêu cầu nạp tiền thất bại')
    } finally {
      setLoading(false)
    }
  }

  const generateBankQR = async (amount: number) => {
    setQrLoading(true)
    try {
      // Mock bank info - in real app, this would come from API
      const mockBankInfo: BankInfo = {
        bankName: 'Vietcombank',
        accountNumber: '1234567890',
        accountName: 'CONG TY PG88',
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Bank:Vietcombank;Account:1234567890;Amount:${amount};Content:NAP TIEN PG88`
      }
      
      setBankInfo(mockBankInfo)
      setShowQRModal(true)
    } catch (error) {
      message.error('Không thể tạo mã QR')
    } finally {
      setQrLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    message.success('Đã sao chép vào clipboard')
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

  const methodInfo = getSelectedMethodInfo()

  return (
    <UserLayout>
      <div className="deposit-container">
        <div className="deposit-header">
          <Title level={3}>Nạp Tiền</Title>
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
        
        <Card className="deposit-card">
          <div className="payment-methods-section">
            <Title level={4}>Chọn Phương Thức Thanh Toán</Title>
            <div className="payment-methods-grid">
              {paymentMethods.map((method) => (
                <PaymentMethodCard
                  key={method.id}
                  method={method}
                  selected={selectedMethod === method.id}
                  onSelect={setSelectedMethod}
                  className="payment-method-card"
                />
              ))}
            </div>
          </div>
          
          <Divider />
          
          <div className="deposit-form-section">
            <Title level={4}>Thông Tin Nạp Tiền</Title>
            <Form
              form={form}
              onFinish={handleSubmit}
              layout="vertical"
              className="deposit-form"
            >
              <Form.Item
                name="amount"
                label="Số Tiền Nạp"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền nạp' },
                  {
                    validator: (_, value) => {
                      const selectedMethod = paymentMethods.find(m => m.id === selectedMethod);
                      if (value && selectedMethod) {
                        if (value < selectedMethod.minimum) {
                          return Promise.reject(new Error(`Số tiền tối thiểu là ${selectedMethod.minimum.toLocaleString('vi-VN')}₫`))
                        }
                        if (value > selectedMethod.maximum) {
                          return Promise.reject(new Error(`Số tiền tối đa là ${selectedMethod.maximum.toLocaleString('vi-VN')}₫`))
                        }
                      }
                      return Promise.resolve()
                    }
                  },
                ]}
              >
                <Input
                  prefix={<DollarOutlined />}
                  placeholder="Nhập số tiền nạp"
                  type="number"
                  size="large"
                  className="amount-input"
                />
              </Form.Item>
              
              {/* Quick Amount Buttons */}
              <div className="quick-amounts">
                <Text className="quick-amounts-label">Số tiền nhanh:</Text>
                <Space wrap>
                  {[100000, 500000, 1000000, 2000000, 5000000].map(amount => (
                    <Button
                      key={amount}
                      size="small"
                      onClick={() => form.setFieldsValue({ amount })}
                      className="quick-amount-btn"
                    >
                      {amount.toLocaleString('vi-VN')}₫
                    </Button>
                  ))}
                </Space>
              </div>
              
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
              
              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  className="deposit-submit-button"
                  loading={loading}
                  size="large"
                  block
                >
                  Xác Nhận Nạp Tiền
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Card>

        {/* QR Code Modal for Bank Transfer */}
        <Modal
          title="Thông Tin Chuyển Khoản"
          open={showQRModal}
          onCancel={() => setShowQRModal(false)}
          footer={null}
          className="qr-modal"
          width={500}
        >
          {qrLoading ? (
            <div className="qr-loading">
              <Spin size="large" />
              <Text>Đang tạo mã QR...</Text>
            </div>
          ) : bankInfo && (
            <div className="bank-info">
              <div className="qr-section">
                <Title level={5}>Quét mã QR để chuyển khoản</Title>
                <div className="qr-code-container">
                  <QRCode
                    value={bankInfo.qrCode || ''}
                    size={200}
                    className="qr-code"
                  />
                </div>
              </div>
              
              <Divider />
              
              <div className="bank-details">
                <Title level={5}>Thông tin tài khoản</Title>
                <Space size="large" style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <div className="bank-detail-row">
                    <Text className="detail-label">Ngân hàng:</Text>
                    <Text className="detail-value">{bankInfo.bankName}</Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(bankInfo.bankName)}
                      size="small"
                    />
                  </div>
                  <div className="bank-detail-row">
                    <Text className="detail-label">Số tài khoản:</Text>
                    <Text className="detail-value">{bankInfo.accountNumber}</Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(bankInfo.accountNumber)}
                      size="small"
                    />
                  </div>
                  <div className="bank-detail-row">
                    <Text className="detail-label">Chủ tài khoản:</Text>
                    <Text className="detail-value">{bankInfo.accountName}</Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(bankInfo.accountName)}
                      size="small"
                    />
                  </div>
                </Space>
              </div>
              
              <div className="transfer-note">
                <Text type="warning">
                  Lưu ý: Vui lòng chuyển đúng số tiền và ghi rõ mã giao dịch trong nội dung chuyển khoản
                </Text>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </UserLayout>
  )
}

export default Deposit