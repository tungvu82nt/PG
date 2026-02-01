import React, { useState } from 'react'
import { Card, Button, Space, Typography, Input, Select, message, Divider } from 'antd'
import { 
  SendOutlined, 
  TestTubeOutlined,
  WifiOutlined,
  DisconnectOutlined 
} from '@ant-design/icons'
import { useWebSocket } from '../../hooks/useWebSocket'
import WebSocketStatus from '../WebSocketStatus/WebSocketStatus'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

const WebSocketTest: React.FC = () => {
  const { 
    socket, 
    isConnected, 
    balance, 
    notifications, 
    onlineUsers,
    emitEvent,
    requestBalanceUpdate,
    clearNotifications
  } = useWebSocket()
  
  const [testEvent, setTestEvent] = useState('get_balance')
  const [testData, setTestData] = useState('{}')
  const [customEvent, setCustomEvent] = useState('')
  
  const handleEmitTest = () => {
    try {
      const data = testData ? JSON.parse(testData) : undefined
      const success = emitEvent(testEvent, data)
      
      if (success) {
        message.success(`Đã gửi event: ${testEvent}`)
      } else {
        message.error('Không thể gửi event - WebSocket chưa kết nối')
      }
    } catch (error) {
      message.error('Dữ liệu JSON không hợp lệ')
    }
  }
  
  const handleCustomEvent = () => {
    if (!customEvent.trim()) {
      message.warning('Vui lòng nhập tên event')
      return
    }
    
    try {
      const data = testData ? JSON.parse(testData) : undefined
      const success = emitEvent(customEvent, data)
      
      if (success) {
        message.success(`Đã gửi custom event: ${customEvent}`)
      } else {
        message.error('Không thể gửi event - WebSocket chưa kết nối')
      }
    } catch (error) {
      message.error('Dữ liệu JSON không hợp lệ')
    }
  }
  
  const testEvents = [
    { value: 'get_balance', label: 'Get Balance', data: '{}' },
    { value: 'join_room', label: 'Join Room', data: '{"room": "test_room"}' },
    { value: 'leave_room', label: 'Leave Room', data: '{"room": "test_room"}' },
    { value: 'get_game_state', label: 'Get Game State', data: '{"gameId": "test_game"}' },
    { value: 'mark_notifications_read', label: 'Mark Notifications Read', data: '{"notificationIds": []}' }
  ]
  
  const handleTestEventChange = (value: string) => {
    setTestEvent(value)
    const event = testEvents.find(e => e.value === value)
    if (event) {
      setTestData(event.data)
    }
  }
  
  return (
    <Card 
      title={
        <Space>
          <TestTubeOutlined />
          WebSocket Test Panel
        </Space>
      }
      extra={<WebSocketStatus showOnlineUsers={true} />}
      style={{ margin: '24px 0' }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size="large">
        {/* Connection Status */}
        <div>
          <Title level={5}>Connection Status</Title>
          <Space>
            {isConnected ? (
              <Text type="success">
                <WifiOutlined /> Connected (Socket ID: {socket?.id})
              </Text>
            ) : (
              <Text type="danger">
                <DisconnectOutlined /> Disconnected
              </Text>
            )}
          </Space>
        </div>
        
        <Divider />
        
        {/* Real-time Data */}
        <div>
          <Title level={5}>Real-time Data</Title>
          <Space direction="vertical">
            <Text>Balance: <Text code>{balance !== null ? balance.toLocaleString('vi-VN') + '₫' : 'N/A'}</Text></Text>
            <Text>Online Users: <Text code>{onlineUsers}</Text></Text>
            <Text>Notifications: <Text code>{notifications.length}</Text></Text>
          </Space>
        </div>
        
        <Divider />
        
        {/* Quick Actions */}
        <div>
          <Title level={5}>Quick Actions</Title>
          <Space wrap>
            <Button 
              type="primary" 
              onClick={requestBalanceUpdate}
              disabled={!isConnected}
            >
              Request Balance Update
            </Button>
            <Button 
              onClick={clearNotifications}
              disabled={notifications.length === 0}
            >
              Clear Notifications ({notifications.length})
            </Button>
          </Space>
        </div>
        
        <Divider />
        
        {/* Test Events */}
        <div>
          <Title level={5}>Test Events</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ width: '100%' }}>
              <Select
                value={testEvent}
                onChange={handleTestEventChange}
                style={{ width: 200 }}
                placeholder="Select test event"
              >
                {testEvents.map(event => (
                  <Option key={event.value} value={event.value}>
                    {event.label}
                  </Option>
                ))}
              </Select>
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleEmitTest}
                disabled={!isConnected}
              >
                Send Event
              </Button>
            </Space>
            
            <TextArea
              value={testData}
              onChange={(e) => setTestData(e.target.value)}
              placeholder="Event data (JSON format)"
              rows={3}
              style={{ fontFamily: 'monospace' }}
            />
          </Space>
        </div>
        
        <Divider />
        
        {/* Custom Event */}
        <div>
          <Title level={5}>Custom Event</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ width: '100%' }}>
              <Input
                value={customEvent}
                onChange={(e) => setCustomEvent(e.target.value)}
                placeholder="Custom event name"
                style={{ width: 200 }}
              />
              <Button 
                type="primary" 
                icon={<SendOutlined />}
                onClick={handleCustomEvent}
                disabled={!isConnected || !customEvent.trim()}
              >
                Send Custom Event
              </Button>
            </Space>
          </Space>
        </div>
        
        {/* Recent Notifications */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <div>
              <Title level={5}>Recent Notifications</Title>
              <div style={{ maxHeight: 200, overflowY: 'auto' }}>
                {notifications.slice(0, 5).map((notification) => (
                  <Card 
                    key={notification.id} 
                    size="small" 
                    style={{ marginBottom: 8 }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <Space direction="vertical" size="small">
                      <Text strong>{notification.title}</Text>
                      <Text type="secondary">{notification.message}</Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        {notification.timestamp.toLocaleString('vi-VN')}
                      </Text>
                    </Space>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
        
        <Divider />
        
        {/* Instructions */}
        <div>
          <Title level={5}>Instructions</Title>
          <Paragraph>
            <Text type="secondary">
              This panel allows you to test WebSocket functionality. Make sure the backend server is running 
              with WebSocket gateway enabled. You can send test events and monitor real-time data updates.
            </Text>
          </Paragraph>
          <Paragraph>
            <Text type="secondary">
              <strong>Note:</strong> Some events may require specific backend implementation to work properly.
            </Text>
          </Paragraph>
        </div>
      </Space>
    </Card>
  )
}

export default WebSocketTest