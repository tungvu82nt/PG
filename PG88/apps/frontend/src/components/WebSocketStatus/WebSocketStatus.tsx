import React from 'react'
import { Tag, Tooltip, Space } from 'antd'
import { 
  WifiOutlined, 
  DisconnectOutlined, 
  LoadingOutlined,
  UserOutlined 
} from '@ant-design/icons'
import { useWebSocket } from '../../hooks/useWebSocket'
import './WebSocketStatus.css'

interface WebSocketStatusProps {
  showOnlineUsers?: boolean
  size?: 'small' | 'default'
  className?: string
}

const WebSocketStatus: React.FC<WebSocketStatusProps> = ({
  showOnlineUsers = false,
  size = 'default',
  className
}) => {
  const { isConnected, onlineUsers } = useWebSocket()
  
  const getStatusConfig = () => {
    if (isConnected) {
      return {
        color: 'success',
        icon: <WifiOutlined />,
        text: 'Kết nối',
        tooltip: 'Kết nối real-time hoạt động tốt'
      }
    }
    
    return {
      color: 'error',
      icon: <DisconnectOutlined />,
      text: 'Mất kết nối',
      tooltip: 'Không có kết nối real-time. Một số tính năng có thể bị hạn chế.'
    }
  }
  
  const status = getStatusConfig()
  
  return (
    <div className={`websocket-status ${className || ''}`}>
      <Space size="small">
        <Tooltip title={status.tooltip}>
          <Tag 
            color={status.color} 
            icon={status.icon}
            className={`status-tag ${size}`}
          >
            {status.text}
          </Tag>
        </Tooltip>
        
        {showOnlineUsers && isConnected && onlineUsers > 0 && (
          <Tooltip title={`${onlineUsers.toLocaleString()} người đang online`}>
            <Tag 
              color="blue" 
              icon={<UserOutlined />}
              className={`online-users-tag ${size}`}
            >
              {onlineUsers.toLocaleString()}
            </Tag>
          </Tooltip>
        )}
      </Space>
    </div>
  )
}

export default WebSocketStatus