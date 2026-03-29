import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const method = req.method;

    // Only audit mutating operations
    if (!['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      return next.handle();
    }

    const action = this.getAction(method, req.route?.path || req.url);
    const resource = this.getResource(req.route?.path || req.url);
    const resourceId = req.params?.id;
    const user = req.user;

    return next.handle().pipe(
      tap(() => {
        // Fire-and-forget (don't block response)
        this.audit
          .log({
            actorId: user?.id,
            actorEmail: user?.email,
            actorRole: user?.role,
            action,
            resource,
            resourceId,
            hotelId: user?.hotelId || req.params?.hotelId,
            ipAddress: req.ip || req.connection?.remoteAddress,
          })
          .catch(() => {}); // never fail the request due to audit
      }),
    );
  }

  private getAction(method: string, path: string): string {
    if (path.includes('check-in')) return 'CHECK_IN';
    if (path.includes('check-out')) return 'CHECK_OUT';
    if (path.includes('approve')) return 'APPROVE';
    if (path.includes('reject')) return 'REJECT';
    if (path.includes('assign')) return 'ASSIGN';
    if (path.includes('unassign')) return 'UNASSIGN';
    if (path.includes('logout')) return 'LOGOUT';
    if (path.includes('login')) return 'LOGIN';
    if (path.includes('register')) return 'REGISTER';
    if (path.includes('provision')) return 'PROVISION';
    if (method === 'POST') return 'CREATE';
    if (method === 'PATCH' || method === 'PUT') return 'UPDATE';
    if (method === 'DELETE') return 'DELETE';
    return method;
  }

  private getResource(path: string): string {
    // Extract resource from URL pattern like /v1/hotels/:id/rooms/:id
    const parts = path
      .replace(/^\/v1\//, '')
      .split('/')
      .filter((p) => !p.startsWith(':'));
    return parts[parts.length - 1] || 'unknown';
  }
}
