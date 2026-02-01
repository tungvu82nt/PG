import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    
    if (!user) {
        throw new ForbiddenException('User not authenticated');
    }

    // Since we are using an existing JWT strategy that might not have role in payload yet,
    // we need to ensure payload includes role, OR fetch user. 
    // Ideally, AuthService should include role in JWT payload. 
    // For now, let's assume 'user' object from Request comes from JwtStrategy using validate() which fetches user or uses payload.
    // If validate() fetches user, 'user' entity is attached. Check src/auth/jwt.strategy.ts.

    // Let's assume user.role is available. 
    if (!requiredRoles.some((role) => user.role === role)) {
        throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
