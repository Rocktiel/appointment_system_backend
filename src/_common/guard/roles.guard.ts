import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { UserTypes } from '../enums/UserTypes.enums';
import { JwtPayload } from '../payloads/jwt.payload';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
  ) {}
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const accesableRoles = this.reflector.get<UserTypes[]>(
      'roles',
      context.getHandler(),
    );
    if (!accesableRoles) return true;
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) throw new UnauthorizedException();
    const token = authorization.split(' ')[1];
    const user: JwtPayload = this.jwtService.verify(token);
    if (user.role === UserTypes.ADMIN) return true;
    const isAccessable = accesableRoles.includes(user.role);

    return isAccessable;
    return true;
  }
}
