import React, { useEffect, useState } from 'react'
import { Statistic, Button, Space, Tooltip } from 'antd'
import { 
  DollarOutlined, 
  ReloadOutlined, 
  WifiOutlined,
  DisconnectOutlined 
} from '@ant-design/icons'
import { useWebSocket } from '../../hooks/useWebSocket'
import { useAuthStore } from '../../store/auth.store'
import './RealTimeBalance.css'

interface RealTimeBalanceProps {
  className?: string
  size?: 'small' | 'default' | 'large'
  showRefreshButton?: boolean
  showConnectionStatus?: boolean
}

const RealTimeBalance: React.FC<RealTimeBalanceProps> = ({
  className,
  size = 'default',
  showRefreshButton = true,
  showConnectionStatus = false
}) => {
  const { balance, isConnected, requestBalanceUpdate } = useWebSocket()
  const { user } = useAuthStore()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [displayBalance, setDisplayBalance] = useState<number>(0)
  
  // Use WebSocket balance if available, fallback to user balance
  const currentBalance = balance !== null ? balance : (user?.balance || 0)
  
  // Animate balance changes
  useEffect(() => {
    if (currentBalance !== displayBalance) {
      const duration = 1000 // 1 second animation
      const steps = 30
      const stepValue = (currentBalance - displayBalance) / steps
      const stepDuration = duration / steps
      
      let currentStep = 0
      const timer = setInterval(() => {
        currentStep++
        if (currentStep >= steps) {
          setDisplayBalance(currentBalance)
          clearInterval(timer)
        } else {
          setDisplayBalance(prev => prev + stepValue)
        }
      }, stepDuration)
      
      return () => clearInterval(timer)
    }
  }, [currentBalance, displayBalance])
  
  const handleRefresh = async () => {
    if (!isConnected) return
    
    setIsRefreshing(true)
    const success = requestBalanceUpdate()
    
    if (success) {
      // Simulate refresh delay for better UX
      setTimeout(() => {
        setIsRefreshing(false)
      }, 1000)
    } else {
      setIsRefreshing(false)
    }
  }
  
  const getConnectionStatusIcon = () => {
    if (isConnected) {
      return (
        <WifiOutlined 
          className="connection-status connected" 
          title="Kết nối real-time"
        />
      )
    }
    return (
      <DisconnectOutlined 
        className="connection-status disconnected" 
        title="Mất kết nối real-time"
      />
    )
  }
  
  const getStatisticSize = () => {
    switch (size) {
      case 'small':
        return { fontSize: '20px' }
      case 'large':
        return { fontSize: '36px' }
      default:
        return { fontSize: '28px' }
    }
  }
  
  return (
    <div className={`real-time-balance ${className || ''}`}>
      <div className="balance-header">
        <Space align="center">
          <DollarOutlined className="balance-icon" />
          <span className="balance-label">Số Dư Tài Khoản</span>
          {showConnectionStatus && getConnectionStatusIcon()}
        </Space>
        {showRefreshButton && (
          <Tooltip title={isConnected ? "Làm mới số dư" : "Không có kết nối real-time"}>
            <Button
              type="text"
              icon={<ReloadOutlined spin={isRefreshing} />}
              onClick={handleRefresh}
              disabled={!isConnected || isRefreshing}
              className="refresh-button"
              size="small"
            />
          </Tooltip>
        )}
      </div>
      
      <div className="balance-display">
        <Statistic
          value={displayBalance}
          precision={0}
          suffix="₫"
          valueStyle={{
            color: isConnected ? '#d0ad4a' : '#8c8c8c',
            fontWeight: 'bold',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            transition: 'all 0.3s ease',
            ...getStatisticSize()
          }}
          className={`balance-statistic ${isConnected ? 'connected' : 'disconnected'}`}
        />
        
        {!isConnected && (
          <div className="offline-indicator">
            <span>Chế độ offline</span>
          </div>
        )}
      </div>
      
      {balance !== null && balance !== user?.balance && (
        <div className="balance-update-indicator">
          <span className="update-dot"></span>
          <span className="update-text">Đã cập nhật</span>
        </div>
      )}
    </div>
  )
}

export default RealTimeBalance