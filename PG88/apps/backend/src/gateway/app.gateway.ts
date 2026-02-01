import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger, UnauthorizedException } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@WebSocketGateway({
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? ['https://yourdomain.com'] 
      : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
  },
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() server: Server;
  private logger: Logger = new Logger('AppGateway');
  private connectedUsers = new Map<string, string>(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private usersService: UsersService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      // Extract JWT token from auth header or handshake auth
      const token = this.extractTokenFromSocket(client);
      
      if (!token) {
        this.logger.warn(`Connection rejected: No token provided from ${client.id}`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token);
      const userId = payload.sub;

      // Verify user exists and is active
      const user = await this.usersService.findOne(userId);
      if (!user || user.status !== 'ACTIVE') {
        this.logger.warn(`Connection rejected: Invalid user ${userId}`);
        client.disconnect();
        return;
      }

      // Store user connection
      this.connectedUsers.set(client.id, userId);
      client.join(`user_${userId}`);
      
      this.logger.log(`Client connected: ${client.id} (User: ${userId})`);
      
      // Emit connection success with user info
      client.emit('connection_success', {
        userId,
        timestamp: new Date().toISOString(),
      });

      // Update online users count
      this.emitOnlineUsersCount();

    } catch (error) {
      this.logger.error(`Connection authentication failed: ${error.message}`);
      client.emit('connection_error', { message: 'Authentication failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = this.connectedUsers.get(client.id);
    if (userId) {
      this.connectedUsers.delete(client.id);
      this.logger.log(`Client disconnected: ${client.id} (User: ${userId})`);
      this.emitOnlineUsersCount();
    }
  }

  private extractTokenFromSocket(client: Socket): string | null {
    // Try to get token from auth header first
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Fallback to auth object (for compatibility)
    const token = client.handshake.auth?.token;
    return token || null;
  }

  private emitOnlineUsersCount() {
    const onlineCount = this.connectedUsers.size;
    this.server.emit('online_users', { count: onlineCount });
  }

  emitBalanceUpdate(userId: string, newBalance: number) {
    this.server.to(`user_${userId}`).emit('balance_update', {
      userId,
      balance: newBalance,
      timestamp: new Date().toISOString(),
    });
    this.logger.log(`Balance update emitted to user ${userId}: ${newBalance}`);
  }

  emitNotification(userId: string, notification: any) {
    this.server.to(`user_${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }

  emitGameResult(userId: string, gameResult: any) {
    this.server.to(`user_${userId}`).emit('game_result', {
      ...gameResult,
      timestamp: new Date().toISOString(),
    });
  }

  emitPromotionAlert(userId: string, promotion: any) {
    this.server.to(`user_${userId}`).emit('promotion_alert', {
      ...promotion,
      timestamp: new Date().toISOString(),
    });
  }

  // Admin broadcast to all connected users
  emitAdminBroadcast(message: any) {
    this.server.emit('admin_broadcast', {
      ...message,
      timestamp: new Date().toISOString(),
    });
  }

  // Get connected users count
  getConnectedUsersCount(): number {
    return this.connectedUsers.size;
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values()).includes(userId);
  }
}
