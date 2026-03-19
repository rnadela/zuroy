import { Module } from '@nestjs/common';
import { ServiceCatalogController } from './service-catalog.controller';
import { ServiceRequestsController } from './service-requests.controller';
import { ServiceCatalogService } from './service-catalog.service';
import { ServiceRequestsService } from './service-requests.service';

@Module({
  controllers: [ServiceCatalogController, ServiceRequestsController],
  providers: [ServiceCatalogService, ServiceRequestsService],
  exports: [ServiceCatalogService, ServiceRequestsService],
})
export class ServicesModule {}
