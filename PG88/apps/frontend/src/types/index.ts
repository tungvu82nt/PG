/**
 * Comprehensive Type Definitions for PG88 Clone Frontend
 * Following enterprise-grade TypeScript best practices
 */

// ============================================================================
// CORE DOMAIN TYPES
// ============================================================================

export interface User {
  readonly id: string
  readonly username: string
  readonly email: string
  readonly role: UserRole
  readonly balance: number
  readonly vipLevel: number
  readonly avatar?: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly isActive: boolean
  readonly referralCode?: string
  readonly referredBy?: string
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  AGENT = 'agent'
}

export interface UserStats {
  readonly totalDeposits: number
  readonly totalWithdrawals: number
  readonly totalGames: number
  readonly vipLevel: number
  readonly vipProgress: number
  readonly winRate?: number
  readonly totalWinnings?: number
  readonly totalLosses?: number
}

// ============================================================================
// WEBSOCKET TYPES
// ============================================================================

export interface WebSocketState {
  readonly socket: Socket | null
  readonly isConnected: boolean
  readonly reconnectAttempts: number
  readonly maxReconnectAttempts: number
  readonly balance: number | null
  readonly notifications: readonly Notification[]
  readonly onlineUsers: number
  readonly connectionId?: string
  readonly lastPingTime?: Date
}

export interface Notification {
  readonly id: string
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly timestamp: Date
  readonly read: boolean
  readonly priority: NotificationPriority
  readonly category?: NotificationCategory
  readonly actionUrl?: string
  readonly metadata?: Record<string, unknown>
}

export enum NotificationType {
  SUCCESS = 'success',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error'
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum NotificationCategory {
  SYSTEM = 'system',
  TRANSACTION = 'transaction',
  GAME = 'game',
  PROMOTION = 'promotion',
  SECURITY = 'security'
}

// ============================================================================
// GAME TYPES
// ============================================================================

export interface Game {
  readonly id: string
  readonly name: string
  readonly provider: GameProvider
  readonly category: GameCategory
  readonly image: string
  readonly isHot: boolean
  readonly isNew: boolean
  readonly jackpot?: number
  readonly minBet: number
  readonly maxBet: number
  readonly rtp?: number
  readonly description?: string
  readonly features: readonly string[]
  readonly isActive: boolean
  readonly sortOrder: number
}

export interface GameProvider {
  readonly id: string
  readonly name: string
  readonly logo: string
  readonly gameCount: number
  readonly isActive: boolean
  readonly description?: string
  readonly website?: string
}

export enum GameCategory {
  SLOTS = 'slots',
  LIVE = 'live',
  FISHING = 'fishing',
  ANIMAL = 'animal',
  SPORTS = 'sports',
  LOTTERY = 'lottery',
  CARD = 'card'
}

export interface GameLaunchRequest {
  readonly gameId: string
  readonly mode: GameMode
  readonly returnUrl?: string
}

export enum GameMode {
  REAL = 'real',
  DEMO = 'demo'
}

// ============================================================================
// TRANSACTION TYPES
// ============================================================================

export interface Transaction {
  readonly id: string
  readonly type: TransactionType
  readonly amount: number
  readonly status: TransactionStatus
  readonly method?: PaymentMethod
  readonly description?: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly completedAt?: Date
  readonly reference?: string
  readonly fee?: number
  readonly metadata?: Record<string, unknown>
}

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  BET = 'bet',
  WIN = 'win',
  BONUS = 'bonus',
  COMMISSION = 'commission',
  REFUND = 'refund'
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum PaymentMethod {
  BANK_TRANSFER = 'bank_transfer',
  E_WALLET = 'e_wallet',
  USDT = 'usdt',
  CREDIT_CARD = 'credit_card'
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  readonly success: boolean
  readonly data?: T
  readonly message?: string
  readonly errors?: readonly ApiError[]
  readonly meta?: ApiMeta
}

export interface ApiError {
  readonly code: string
  readonly message: string
  readonly field?: string
  readonly details?: Record<string, unknown>
}

export interface ApiMeta {
  readonly page?: number
  readonly limit?: number
  readonly total?: number
  readonly totalPages?: number
  readonly hasNext?: boolean
  readonly hasPrev?: boolean
}

export interface PaginationParams {
  readonly page?: number
  readonly limit?: number
  readonly sortBy?: string
  readonly sortOrder?: 'asc' | 'desc'
}

// ============================================================================
// COMPONENT PROPS TYPES
// ============================================================================

export interface BaseComponentProps {
  readonly className?: string
  readonly style?: React.CSSProperties
  readonly testId?: string
}

export interface LoadingState {
  readonly isLoading: boolean
  readonly error?: string | null
  readonly lastUpdated?: Date
}

export interface FormState<T = Record<string, unknown>> {
  readonly values: T
  readonly errors: Record<keyof T, string>
  readonly touched: Record<keyof T, boolean>
  readonly isSubmitting: boolean
  readonly isValid: boolean
}

// ============================================================================
// WEBSOCKET EVENT TYPES
// ============================================================================

export interface WebSocketEvents {
  // Connection events
  connect: () => void
  disconnect: (reason: string) => void
  connect_error: (error: Error) => void
  
  // Data events
  balance_updated: (data: BalanceUpdateEvent) => void
  notification: (data: NotificationEvent) => void
  online_users: (count: number) => void
  game_result: (data: GameResultEvent) => void
  promotion_alert: (data: PromotionAlertEvent) => void
  admin_broadcast: (data: AdminBroadcastEvent) => void
}

export interface BalanceUpdateEvent {
  readonly balance: number
  readonly reason?: string
  readonly transactionId?: string
  readonly timestamp: Date
}

export interface NotificationEvent {
  readonly type: NotificationType
  readonly title: string
  readonly message: string
  readonly priority: NotificationPriority
  readonly category: NotificationCategory
  readonly actionUrl?: string
  readonly metadata?: Record<string, unknown>
}

export interface GameResultEvent {
  readonly gameId: string
  readonly result: 'win' | 'lose' | 'draw'
  readonly amount: number
  readonly winAmount?: number
  readonly timestamp: Date
}

export interface PromotionAlertEvent {
  readonly title: string
  readonly message: string
  readonly link?: string
  readonly imageUrl?: string
  readonly validUntil?: Date
}

export interface AdminBroadcastEvent {
  readonly message: string
  readonly type: NotificationType
  readonly targetUsers?: readonly string[]
  readonly timestamp: Date
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type NonEmptyArray<T> = [T, ...T[]]

export type ValueOf<T> = T[keyof T]

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface AppConfig {
  readonly apiUrl: string
  readonly wsUrl: string
  readonly appName: string
  readonly version: string
  readonly environment: 'development' | 'staging' | 'production'
  readonly features: FeatureFlags
  readonly limits: AppLimits
}

export interface FeatureFlags {
  readonly enableWebSocket: boolean
  readonly enableNotifications: boolean
  readonly enableGameLaunch: boolean
  readonly enableRealTimeBalance: boolean
  readonly enableDebugMode: boolean
}

export interface AppLimits {
  readonly maxNotifications: number
  readonly reconnectAttempts: number
  readonly requestTimeout: number
  readonly maxFileSize: number
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode?: number,
    public readonly details?: Record<string, unknown>
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly field: string,
    details?: Record<string, unknown>
  ) {
    super(message, 'VALIDATION_ERROR', 400, details)
    this.name = 'ValidationError'
  }
}

export class NetworkError extends AppError {
  constructor(
    message: string,
    public readonly originalError?: Error
  ) {
    super(message, 'NETWORK_ERROR', 0)
    this.name = 'NetworkError'
  }
}

export class WebSocketError extends AppError {
  constructor(
    message: string,
    public readonly reason?: string
  ) {
    super(message, 'WEBSOCKET_ERROR', 0)
    this.name = 'WebSocketError'
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export * from './socket.io-client'

// Re-export commonly used types for convenience
export type {
  Socket
} from 'socket.io-client'