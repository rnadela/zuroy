import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const paramHotelId = req.params.hotelId;

    if (!paramHotelId) return true;
    if (req.user?.role === 'SUPER_ADMIN') return true;

    if (req.user?.hotelId !== paramHotelId) {
      throw new ForbiddenException('Access denied to this hotel');
    }
    return true;
  }
}
