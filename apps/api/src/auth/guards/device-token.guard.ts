import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

export const IS_DEVICE_KEY = 'isDevice';

@Injectable()
export class DeviceTokenGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isDevice = this.reflector.getAllAndOverride<boolean>(IS_DEVICE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!isDevice) return true;

    const req = context.switchToHttp().getRequest();
    const token = req.headers['x-device-token'];
    if (!token) throw new UnauthorizedException('Device token required');

    // Token validation happens in the service layer (lookup by hashed token)
    // This guard just ensures the header exists
    req.deviceToken = token;
    return true;
  }
}
