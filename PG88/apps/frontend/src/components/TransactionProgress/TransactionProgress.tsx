import React from 'react'
import { Steps, Card, Typography, Space, Tag, Button, Progress } from 'antd'
import type { StepProps } from 'antd'
import { 
  LoadingOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons'
import './TransactionProgress.css'

const { Title, Text } = Typography

export interface TransactionStep {
  title: string
  description: string
  status: 'wait' | 'process' | 'finish' | 'error'
  timestamp?: Date
}

export interface Transaction {
  id: string
  type: 'deposit' | 'withdraw'
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  paymentMethod?: string
  createdAt: Date
  updatedAt?: Date
  steps: TransactionStep[]
  estimatedTime?: number // in minutes
  actualTime?: number // in minutes
}

interface TransactionProgressProps {
  transaction: Transaction
  showDetails?: boolean
  onCancel?: (transactionId: string) => void
  onRetry?: (transactionId: string) => void
  className?: string
}

const TransactionProgress: React.FC<TransactionProgressProps> = ({
  transaction,
  showDetails = true,
  onCancel,
  onRetry,
  className
}) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />
      case 'processing':
        return <LoadingOutlined style={{ color: '#1890ff' }} />
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'failed':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      case 'cancelled':
        return <ExclamationCircleOutlined style={{ color: '#8c8c8c' }} />
      default:
        return <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'orange'
      case 'processing':
        return 'blue'
      case 'completed':
        return 'green'
      case 'failed':
        return 'red'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Chờ xử lý'
      case 'processing':
        return 'Đang xử lý'
      case 'completed':
        return 'Hoàn thành'
      case 'failed':
        return 'Thất bại'
      case 'cancelled':
        return 'Đã hủy'
      default:
        return 'Không xác định'
    }
  }

  const getCurrentStep = () => {
    const currentStepIndex = transaction.steps.findIndex(step => 
      step.status === 'process' || step.status === 'error'
    )
    return currentStepIndex >= 0 ? currentStepIndex : transaction.steps.length - 1
  }

  const getProgressPercent = () => {
    const completedSteps = transaction.steps.filter(step => step.status === 'finish').length
    return Math.round((completedSteps / transaction.steps.length) * 100)
  }

  const getEstimatedTimeRemaining = () => {
    if (!transaction.estimatedTime) return null
    
    const elapsed = transaction.updatedAt 
      ? Math.floor((new Date().getTime() - transaction.updatedAt.getTime()) / 60000)
      : 0
    
    const remaining = Math.max(0, transaction.estimatedTime - elapsed)
    return remaining
  }

  const canCancel = transaction.status === 'pending' || transaction.status === 'processing'
  const canRetry = transaction.status === 'failed'
  const timeRemaining = getEstimatedTimeRemaining()

  return (
    <Card 
      className={`transaction-progress ${className || ''}`}
      title={
        <div className="transaction-header">
          <Space>
            {getStatusIcon(transaction.status)}
            <Title level={5} style={{ margin: 0, color: 'white' }}>
              {transaction.type === 'deposit' ? 'Nạp tiền' : 'Rút tiền'} - {transaction.id}
            </Title>
          </Space>
          <Tag color={getStatusColor(transaction.status)} className="status-tag">
            {getStatusText(transaction.status)}
          </Tag>
        </div>
      }
    >
      <div className="transaction-info">
        <Space size="large" style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
          {/* Transaction Summary */}
          <div className="transaction-summary">
            <Space size="small" style={{ width: '100%', flexDirection: 'column', alignItems: 'flex-start' }}>
              <div className="summary-row">
                <Text className="summary-label">Số tiền:</Text>
                <Text className="summary-value amount">
                  {transaction.amount.toLocaleString('vi-VN')}₫
                </Text>
              </div>
              {transaction.paymentMethod && (
                <div className="summary-row">
                  <Text className="summary-label">Phương thức:</Text>
                  <Text className="summary-value">{transaction.paymentMethod}</Text>
                </div>
              )}
              <div className="summary-row">
                <Text className="summary-label">Thời gian tạo:</Text>
                <Text className="summary-value">
                  {transaction.createdAt.toLocaleString('vi-VN')}
                </Text>
              </div>
              {transaction.updatedAt && (
                <div className="summary-row">
                  <Text className="summary-label">Cập nhật lần cuối:</Text>
                  <Text className="summary-value">
                    {transaction.updatedAt.toLocaleString('vi-VN')}
                  </Text>
                </div>
              )}
            </Space>
          </div>

          {/* Progress Bar */}
          {(transaction.status === 'processing' || transaction.status === 'pending') && (
            <div className="progress-section">
              <div className="progress-header">
                <Text className="progress-label">Tiến độ xử lý</Text>
                <Text className="progress-percent">{getProgressPercent()}%</Text>
              </div>
              <Progress
                percent={getProgressPercent()}
                strokeColor={{
                  '0%': '#d0ad4a',
                  '100%': '#ffd700',
                }}
                showInfo={false}
                className="transaction-progress-bar"
              />
              {timeRemaining !== null && timeRemaining > 0 && (
                <Text className="time-remaining">
                  Thời gian còn lại: ~{timeRemaining} phút
                </Text>
              )}
            </div>
          )}

          {/* Transaction Steps */}
          {showDetails && (
            <div className="transaction-steps">
              <Title level={5} style={{ color: 'white', marginBottom: 16 }}>
                Chi tiết xử lý
              </Title>
              <Steps
                current={getCurrentStep()}
                size="small"
                className="custom-steps"
                items={transaction.steps.map((step, index) => ({
                  title: step.title,
                  description: (
                    <div className="step-description">
                      <Text className="step-desc-text">{step.description}</Text>
                      {step.timestamp && (
                        <Text className="step-timestamp">
                          {step.timestamp.toLocaleString('vi-VN')}
                        </Text>
                      )}
                    </div>
                  ),
                  status: step.status,
                  icon: step.status === 'process' ? <LoadingOutlined /> :
                        step.status === 'error' ? <CloseCircleOutlined /> :
                        undefined
                } as StepProps))}
              />
            </div>
          )}

          {/* Action Buttons */}
          {(canCancel || canRetry) && (
            <div className="transaction-actions">
              <Space>
                {canCancel && onCancel && (
                  <Button 
                    danger 
                    onClick={() => onCancel(transaction.id)}
                    className="cancel-button"
                  >
                    Hủy giao dịch
                  </Button>
                )}
                {canRetry && onRetry && (
                  <Button 
                    type="primary" 
                    onClick={() => onRetry(transaction.id)}
                    className="retry-button"
                  >
                    Thử lại
                  </Button>
                )}
              </Space>
            </div>
          )}
        </Space>
      </div>
    </Card>
  )
}

export default TransactionProgress