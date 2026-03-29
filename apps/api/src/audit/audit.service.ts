import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface AuditEntry {
  actorId?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  resource: string;
  resourceId?: string;
  hotelId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({ data: entry });
  }

  async findByResource(resource: string, resourceId: string) {
    return this.prisma.auditLog.findMany({
      where: { resource, resourceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findByActor(actorId: string) {
    return this.prisma.auditLog.findMany({
      where: { actorId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async findByHotel(hotelId: string) {
    return this.prisma.auditLog.findMany({
      where: { hotelId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
