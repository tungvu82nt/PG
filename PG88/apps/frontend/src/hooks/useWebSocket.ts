import { useEffect, useCallback } from 'react'
import { useWebSocketStore } from '../store/websocket.store'
import { useAuthStore } from '../store/auth.store'

/**
 * Custom hook for WebSocket connection management
 * Automatically connects when user is authenticated and disconnects on logout
 */
export const useWebSocket = () => {
  const { 
    socket, 
    isConnected, 
    balance, 
    notifications, 
    onlineUsers,
    connect, 
    disconnect,
    clearNotifications 
  } = useWebSocketStore()
  
  const { token, isAuthenticated, user } = useAuthStore()
  
  // Auto-connect when authenticated
  useEffect(() => {
    if (isAuthenticated && token && !socket) {
      console.log('🔌 Auto-connecting WebSocket for user:', user?.username)
      connect(token)
    }
    
    if (!isAuthenticated && socket) {
      console.log('🔌 Auto-disconnecting WebSocket (user logged out)')
      disconnect()
    }
    
    return () => {
      // Cleanup on unmount
      if (socket && isConnected) {
        disconnect()
      }
    }
  }, [isAuthenticated, token, socket, connect, disconnect, user?.username, isConnected])
  
  // Emit events to server
  const emitEvent = useCallback((event: string, data?: any) => {
    if (socket && isConnected) {
      socket.emit(event, data)
      return true
    }
    console.warn('⚠️ Cannot emit event - WebSocket not connected:', event)
    return false
  }, [socket, isConnected])
  
  // Join specific rooms
  const joinRoom = useCallback((room: string) => {
    return emitEvent('join_room', { room })
  }, [emitEvent])
  
  const leaveRoom = useCallback((room: string) => {
    return emitEvent('leave_room', { room })
  }, [emitEvent])
  
  // Game-specific events
  const joinGameRoom = useCallback((gameId: string) => {
    return joinRoom(`game_${gameId}`)
  }, [joinRoom])
  
  const leaveGameRoom = useCallback((gameId: string) => {
    return leaveRoom(`game_${gameId}`)
  }, [leaveRoom])
  
  // Request balance update
  const requestBalanceUpdate = useCallback(() => {
    return emitEvent('get_balance')
  }, [emitEvent])
  
  // Mark notifications as read
  const markNotificationsAsRead = useCallback(() => {
    const unreadNotifications = notifications.filter(n => !n.read)
    if (unreadNotifications.length > 0) {
      emitEvent('mark_notifications_read', {
        notificationIds: unreadNotifications.map(n => n.id)
      })
    }
  }, [notifications, emitEvent])
  
  return {
    // Connection state
    socket,
    isConnected,
    
    // Real-time data
    balance,
    notifications,
    onlineUsers,
    unreadNotificationsCount: notifications.filter(n => !n.read).length,
    
    // Actions
    connect,
    disconnect,
    emitEvent,
    joinRoom,
    leaveRoom,
    joinGameRoom,
    leaveGameRoom,
    requestBalanceUpdate,
    markNotificationsAsRead,
    clearNotifications
  }
}

/**
 * Hook for game-specific WebSocket functionality
 */
export const useGameWebSocket = (gameId?: string) => {
  const webSocket = useWebSocket()
  
  useEffect(() => {
    if (gameId && webSocket.isConnected) {
      webSocket.joinGameRoom(gameId)
      
      return () => {
        webSocket.leaveGameRoom(gameId)
      }
    }
  }, [gameId, webSocket])
  
  const placeBet = useCallback((betData: any) => {
    return webSocket.emitEvent('place_bet', { gameId, ...betData })
  }, [gameId, webSocket])
  
  const requestGameState = useCallback(() => {
    return webSocket.emitEvent('get_game_state', { gameId })
  }, [gameId, webSocket])
  
  return {
    ...webSocket,
    placeBet,
    requestGameState
  }
}

/**
 * Hook for admin-specific WebSocket functionality
 */
export const useAdminWebSocket = () => {
  const webSocket = useWebSocket()
  const { isAdmin } = useAuthStore()
  
  useEffect(() => {
    if (isAdmin && webSocket.isConnected) {
      webSocket.joinRoom('admin')
      
      return () => {
        webSocket.leaveRoom('admin')
      }
    }
  }, [isAdmin, webSocket])
  
  const broadcastNotification = useCallback((notification: {
    type: 'success' | 'info' | 'warning' | 'error'
    title: string
    message: string
    targetUsers?: string[]
  }) => {
    return webSocket.emitEvent('admin_broadcast', notification)
  }, [webSocket])
  
  const requestSystemStats = useCallback(() => {
    return webSocket.emitEvent('get_system_stats')
  }, [webSocket])
  
  return {
    ...webSocket,
    broadcastNotification,
    requestSystemStats
  }
}