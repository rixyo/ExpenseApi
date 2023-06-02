import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import { PrismaService } from 'src/prisma/prisma.service';
interface JWTPayload {
  id: string;
  name: string;
  iat: number;
  exp: number;
}
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    try {
      const roles = this.reflector.get<UserRole[]>(
        'roles',
        context.getHandler(),
      );
      if (!roles) {
        return true;
      }
      const request = context.switchToHttp().getRequest();
      const token = request?.headers?.authorization?.split('Bearer ')[1];
      if (!token) {
        return false;
      }
      const user = jwt.verify(token, process.env.JWT_SECRET) as JWTPayload;
      request.user = user;
      return this.matchRoles(roles, user.id);
    } catch (error) {
      return false;
    }
  }
  async matchRoles(roles: UserRole[], userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    return roles.includes(user.role);
  }
}
