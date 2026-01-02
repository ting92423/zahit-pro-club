import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Role } from './roles';
import { ROLES_KEY } from './roles.decorator';
import jwt from 'jsonwebtoken';

type RequestWithRole = {
  headers: Record<string, string | string[] | undefined>;
  user?: { role?: Role; memberId?: string };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles =
      this.reflector.getAllAndOverride<Role[] | undefined>(ROLES_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (requiredRoles.length === 0) return true;

    const req = context.switchToHttp().getRequest<RequestWithRole>();

    const auth = req.headers['authorization'];
    const bearer = Array.isArray(auth) ? auth[0] : auth;
    const token = bearer?.startsWith('Bearer ')
      ? bearer.slice('Bearer '.length)
      : undefined;

    if (!token) throw new UnauthorizedException('Missing token');

    const secret = process.env.JWT_SECRET;
    if (!secret) throw new UnauthorizedException('JWT_SECRET not configured');

    let payload: any;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    const role = payload?.role as Role | undefined;
    const memberId =
      typeof payload?.memberId === 'string' ? payload.memberId : undefined;

    if (!role) throw new UnauthorizedException('Missing role');

    // 讓後續 controller/service 可以取得當前使用者資訊
    req.user = { role, memberId };

    return requiredRoles.includes(role);
  }
}
