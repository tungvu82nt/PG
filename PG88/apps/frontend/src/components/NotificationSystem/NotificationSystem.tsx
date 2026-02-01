import React, { useState } from 'react'
import { 
  Badge, 
  Dropdown, 
  List, 
  Typography, 
  Button, 
  Empty, 
  Space,
  Tag,
  Divider
} from 'antd'
import { 
  BellOutlined, 
  CheckOutlined, 
  DeleteOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons'
import { useWebSocket } from '../../hooks/useWebSocket'
import './NotificationSystem.css'

const { Text, Title } = Typography

interface NotificationSystemProps {
  className?: string
}

const NotificationSystem: React.FC<NotificationSystemProps> = ({ className }) => {
  const { 
    notifications, 
    unreadNotificationsCount, 
    markNotificationsAsRead, 
    clearNotifications 
  } = useWebSocket()
  
  const [dropdownVisible, setDropdownVisible] = useState(false)
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'warning':
        return <ExclamationCircleOutlined style={{ color: '#faad14' }} />
      case 'error':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
  }
  
  const getNotificationTypeTag = (type: string) => {
    const colors = {
      success: 'green',
      info: 'blue',
      warning: 'orange',
      error: 'red'
    }
    
    const labels = {
      success: 'Thành công',
      info: 'Thông tin',
      warning: 'Cảnh báo',
      error: 'Lỗi'
    }
    
    return (
      <Tag color={colors[type as keyof typeof colors]} size="small">
        {labels[type as keyof typeof labels]}
      </Tag>
    )
  }
  
  const handleMarkAllAsRead = () => {
    markNotificationsAsRead()
  }
  
  const handleClearAll = () => {
    clearNotifications()
    setDropdownVisible(false)
  }
  
  const formatTime = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Vừa xong'
    if (minutes < 60) return `${minutes} phút trước`
    if (hours < 24) return `${hours} giờ trước`
    return `${days} ngày trước`
  }
  
  const notificationDropdown = (
    <div className="notification-dropdown">
      <div className="notification-header">
        <Title level={5} style={{ margin: 0, color: 'white' }}>
          Thông Báo
        </Title>
        <Space>
          {unreadNotificationsCount > 0 && (
            <Button 
              type="link" 
              size="small" 
              icon={<CheckOutlined />}
              onClick={handleMarkAllAsRead}
              style={{ color: '#d0ad4a' }}
            >
              Đánh dấu đã đọc
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              type="link" 
              size="small" 
              icon={<DeleteOutlined />}
              onClick={handleClearAll}
              style={{ color: '#ff4d4f' }}
            >
              Xóa tất cả
            </Button>
          )}
        </Space>
      </div>
      
      <Divider style={{ margin: '8px 0' }} />
      
      <div className="notification-list">
        {notifications.length > 0 ? (
          <List
            dataSource={notifications.slice(0, 10)} // Show only latest 10
            renderItem={(notification) => (
              <List.Item 
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                key={notification.id}
              >
                <div className="notification-content">
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-body">
                    <div className="notification-title">
                      <Text strong style={{ color: 'white' }}>
                        {notification.title}
                      </Text>
                      {getNotificationTypeTag(notification.type)}
                    </div>
                    <Text className="notification-message">
                      {notification.message}
                    </Text>
                    <Text className="notification-time">
                      {formatTime(notification.timestamp)}
                    </Text>
                  </div>
                  {!notification.read && (
                    <div className="unread-indicator" />
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Không có thông báo nào"
            style={{ padding: '20px 0' }}
          />
        )}
      </div>
      
      {notifications.length > 10 && (
        <div className="notification-footer">
          <Button type="link" style={{ color: '#d0ad4a' }}>
            Xem tất cả thông báo
          </Button>
        </div>
      )}
    </div>
  )
  
  return (
    <Dropdown
      overlay={notificationDropdown}
      trigger={['click']}
      placement="bottomRight"
      visible={dropdownVisible}
      onVisibleChange={setDropdownVisible}
      overlayClassName="notification-dropdown-overlay"
    >
      <Badge count={unreadNotificationsCount} size="small" offset={[-2, 2]}>
        <Button
          type="text"
          icon={<BellOutlined />}
          className={`notification-bell ${className}`}
          style={{ 
            color: 'white', 
            fontSize: '18px',
            border: 'none',
            background: 'transparent'
          }}
        />
      </Badge>
    </Dropdown>
  )
}

export default NotificationSystem