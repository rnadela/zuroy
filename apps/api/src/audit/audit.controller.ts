import { Controller, Get, Query, Param } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuditService } from './audit.service';

@Controller('admin/audit')
@Roles('SUPER_ADMIN')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  findAll(
    @Query('hotelId') hotelId?: string,
    @Query('actorId') actorId?: string,
  ) {
    if (hotelId) return this.audit.findByHotel(hotelId);
    if (actorId) return this.audit.findByActor(actorId);
    return this.audit.findByHotel(''); // empty = recent across all
  }

  @Get(':resource/:resourceId')
  findByResource(
    @Param('resource') resource: string,
    @Param('resourceId') resourceId: string,
  ) {
    return this.audit.findByResource(resource, resourceId);
  }
}
