import React from 'react'
import { Card, Space, Typography, Tag, Button } from 'antd'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import './PaymentMethodCard.css'

const { Text, Title } = Typography

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

interface PaymentMethodCardProps {
  method: PaymentMethod
  selected: boolean
  onSelect: (methodId: string) => void
  className?: string
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  method,
  selected,
  onSelect,
  className
}) => {
  return (
    <Card
      className={`payment-method-card ${selected ? 'selected' : ''} ${className || ''}`}
      hoverable
      onClick={() => onSelect(method.id)}
      styles={{ body: { padding: '20px' } }}
    >
      <div className="payment-method-header">
        <Space align="center">
          <div className="payment-method-icon">
            {method.icon}
          </div>
          <div className="payment-method-info">
            <Title level={5} style={{ margin: 0, color: 'white' }}>
              {method.name}
            </Title>
            <Text className="payment-method-description">
              {method.description}
            </Text>
          </div>
        </Space>
        
        <div className="payment-method-badges">
          {method.isPopular && (
            <Tag color="gold" className="popular-badge">
              Phổ biến
            </Tag>
          )}
          {method.isInstant && (
            <Tag color="green" className="instant-badge">
              <CheckCircleOutlined /> Tức thì
            </Tag>
          )}
        </div>
      </div>
      
      <div className="payment-method-details">
        <div className="payment-limits">
          <Space direction="vertical" size="small">
            <Space>
              <Text className="limit-label">Tối thiểu:</Text>
              <Text className="limit-value">
                {method.minimum.toLocaleString('vi-VN')}₫
              </Text>
            </Space>
            <Space>
              <Text className="limit-label">Tối đa:</Text>
              <Text className="limit-value">
                {method.maximum.toLocaleString('vi-VN')}₫
              </Text>
            </Space>
          </Space>
        </div>
        
        <div className="payment-processing">
          <Space align="center">
            <ClockCircleOutlined className="processing-icon" />
            <Text className="processing-time">{method.processingTime}</Text>
          </Space>
          {method.fee && (
            <Text className="processing-fee">Phí: {method.fee}</Text>
          )}
        </div>
      </div>
      
      {method.features && method.features.length > 0 && (
        <div className="payment-features">
          <Space wrap size="small">
            {method.features.map((feature, index) => (
              <Tag key={index} className="feature-tag">
                {feature}
              </Tag>
            ))}
          </Space>
        </div>
      )}
      
      <div className="payment-method-footer">
        <Button
          type={selected ? "primary" : "default"}
          className="select-button"
          block
        >
          {selected ? 'Đã chọn' : 'Chọn phương thức này'}
        </Button>
      </div>
      
      {selected && (
        <div className="selected-indicator">
          <CheckCircleOutlined />
        </div>
      )}
    </Card>
  )
}

export default PaymentMethodCard