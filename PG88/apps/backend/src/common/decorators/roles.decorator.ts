import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export class RolesDecorator {
    static readonly ROLES_KEY = 'roles';
}

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
