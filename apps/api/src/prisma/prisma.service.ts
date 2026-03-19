import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@zuroy/database';
import { ClsService } from 'nestjs-cls';
import { tenantExtension } from './prisma-tenant.extension';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private _tenantClient: ReturnType<typeof this.$extends>;

  constructor(private readonly cls: ClsService) {
    super();
    this._tenantClient = this.$extends(tenantExtension(this.cls));
  }

  /** Auto-scoped by hotelId from JWT via CLS. Use for all tenant-scoped queries. */
  get tenant() {
    return this._tenantClient;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
