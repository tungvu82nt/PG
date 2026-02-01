import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'
import { message, notification } from 'antd'

interface WebSocketState {
  socket: Socket | null
  isConnected: boolean
  reconnectAttempts: number
  maxReconnectAttempts: number
  
  // Real-time data
  balance: number | null
  notifications: Notification[]
  onlineUsers: number
  
  // Configuration
  maxNotifications: number
  notificationRetentionTime: number // in milliseconds
  
  // Actions
  connect: (token: string) => void
  disconnect: () => void
  updateBalance: (balance: number) => void
  addNotification: (notification: Notification) => void
  clearNotifications: () => void
  clearOldNotifications: () => void
  setOnlineUsers: (count: number) => void
  markNotificationAsRead: (id: string) => void
  removeNotification: (id: string) => void
}

interface Notification {
  id: string
  type: 'success' | 'info' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
}

export const useWebSocketStore = create<WebSocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  reconnectAttempts: 0,
  maxReconnectAttempts: 5,
  
  balance: null,
  notifications: [],
  onlineUsers: 0,
  
  // Configuration for memory management
  maxNotifications: 50, // Keep only last 50 notifications
  notificationRetentionTime: 24 * 60 * 60 * 1000, // 24 hours
  
  connect: (token: string) => {
    const { socket: existingSocket, clearOldNotifications } = get()
    
    // Disconnect existing socket if any
    if (existingSocket) {
      existingSocket.removeAllListeners()
      existingSocket.disconnect()
    }
    
    // Clear old notifications on connect
    clearOldNotifications()
    
    // Create new socket connection with proper auth
    const socket = io('http://localhost:8001', {
      auth: {
        token // Keep for backward compatibility
      },
      extraHeaders: {
        'Authorization': `Bearer ${token}` // Proper JWT auth
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000
    })
    
    // Connection event handlers
    socket.on('connect', () => {
      console.log('✅ WebSocket connected:', socket.id)
      set({ 
        socket, 
        isConnected: true, 
        reconnectAttempts: 0 
      })
      
      message.success('Kết nối real-time thành công!')
    })
    
    socket.on('disconnect', (reason) => {
      console.log('❌ WebSocket disconnected:', reason)
      set({ isConnected: false })
      
      if (reason === 'io server disconnect') {
        // Server disconnected, need to reconnect manually
        socket.connect()
      }
    })
    
    socket.on('connect_error', (error) => {
      console.error('🔴 WebSocket connection error:', error)
      const { reconnectAttempts, maxReconnectAttempts } = get()
      
      if (reconnectAttempts < maxReconnectAttempts) {
        set({ reconnectAttempts: reconnectAttempts + 1 })
        message.warning(`Đang thử kết nối lại... (${reconnectAttempts + 1}/${maxReconnectAttempts})`)
      } else {
        message.error('Không thể kết nối real-time. Vui lòng tải lại trang.')
        socket.removeAllListeners()
        socket.disconnect()
      }
    })
    
    // Real-time event handlers with memory management
    socket.on('balance_update', (data) => {
      console.log('💰 Balance updated:', data)
      set({ balance: data.balance })
      
      // Add notification for balance update
      get().addNotification({
        id: `balance_${Date.now()}`,
        type: 'success',
        title: 'Số dư cập nhật',
        message: `Số dư mới: ${data.balance.toLocaleString()} VND`,
        timestamp: new Date(),
        read: false
      })
    })
    
    socket.on('notification', (data) => {
      console.log('🔔 Notification received:', data)
      get().addNotification({
        id: data.id || `notif_${Date.now()}`,
        type: data.type || 'info',
        title: data.title || 'Thông báo',
        message: data.message,
        timestamp: new Date(data.timestamp || Date.now()),
        read: false
      })
    })
    
    socket.on('online_users', (data) => {
      console.log('👥 Online users:', data.count)
      set({ onlineUsers: data.count })
    })
    
    socket.on('game_result', (data) => {
      console.log('🎮 Game result:', data)
      get().addNotification({
        id: `game_${Date.now()}`,
        type: data.win ? 'success' : 'info',
        title: data.win ? 'Chúc mừng!' : 'Kết quả game',
        message: data.win ? `Bạn đã thắng ${data.amount} VND!` : `Kết quả: ${data.result}`,
        timestamp: new Date(),
        read: false
      })
    })
    
    socket.on('promotion_alert', (data) => {
      console.log('🎁 Promotion alert:', data)
      get().addNotification({
        id: `promo_${Date.now()}`,
        type: 'info',
        title: 'Khuyến mãi mới!',
        message: data.message,
        timestamp: new Date(),
        read: false
      })
      
      // Show Ant Design notification for promotions
      notification.info({
        message: 'Khuyến mãi mới!',
        description: data.message,
        duration: 10,
        placement: 'topRight'
      })
    })
    
    socket.on('admin_broadcast', (data) => {
      console.log('📢 Admin broadcast:', data)
      get().addNotification({
        id: `admin_${Date.now()}`,
        type: 'warning',
        title: 'Thông báo hệ thống',
        message: data.message,
        timestamp: new Date(),
        read: false
      })
      
      // Show important admin messages as notifications
      notification.warning({
        message: 'Thông báo hệ thống',
        description: data.message,
        duration: 15,
        placement: 'topRight'
      })
    })
    
    // Store socket reference
    set({ socket })
  },
  
  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.removeAllListeners()
      socket.disconnect()
      set({ 
        socket: null, 
        isConnected: false, 
        reconnectAttempts: 0,
        balance: null,
        onlineUsers: 0
      })
      console.log('🔌 WebSocket disconnected manually')
    }
  },
  
  updateBalance: (balance: number) => {
    set({ balance })
  },
  
  addNotification: (notification: Notification) => {
    const { notifications, maxNotifications, clearOldNotifications } = get()
    
    // Add new notification
    const newNotifications = [notification, ...notifications]
    
    // Limit notifications to prevent memory leak
    const limitedNotifications = newNotifications.slice(0, maxNotifications)
    
    set({ notifications: limitedNotifications })
    
    // Periodically clean old notifications
    clearOldNotifications()
  },
  
  clearNotifications: () => {
    set({ notifications: [] })
  },
  
  clearOldNotifications: () => {
    const { notifications, notificationRetentionTime } = get()
    const now = Date.now()
    
    const filteredNotifications = notifications.filter(notification => {
      const notificationTime = new Date(notification.timestamp).getTime()
      return (now - notificationTime) < notificationRetentionTime
    })
    
    if (filteredNotifications.length !== notifications.length) {
      set({ notifications: filteredNotifications })
      console.log(`🧹 Cleaned ${notifications.length - filteredNotifications.length} old notifications`)
    }
  },
  
  setOnlineUsers: (count: number) => {
    set({ onlineUsers: count })
  },
  
  markNotificationAsRead: (id: string) => {
    const { notifications } = get()
    const updatedNotifications = notifications.map(notification =>
      notification.id === id ? { ...notification, read: true } : notification
    )
    set({ notifications: updatedNotifications })
  },
  
  removeNotification: (id: string) => {
    const { notifications } = get()
    const filteredNotifications = notifications.filter(notification => notification.id !== id)
    set({ notifications: filteredNotifications })
  }
}))

// Helper functions
export const connectWebSocket = (token: string) => {
  const { connect } = useWebSocketStore.getState()
  connect(token)
}

export const disconnectWebSocket = () => {
  const { disconnect } = useWebSocketStore.getState()
  disconnect()
}

export const getWebSocketConnection = () => {
  const { socket, isConnected } = useWebSocketStore.getState()
  return { socket, isConnected }
}

// Auto cleanup old notifications every 5 minutes
setInterval(() => {
  const store = useWebSocketStore.getState()
  store.clearOldNotifications()
}, 5 * 60 * 1000)