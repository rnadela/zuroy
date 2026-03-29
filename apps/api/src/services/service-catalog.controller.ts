import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { ServiceCatalogService } from './service-catalog.service';
import {
  createServiceItemSchema,
  updateServiceItemSchema,
} from './dto/service.dto';
import type {
  CreateServiceItemDto,
  UpdateServiceItemDto,
} from './dto/service.dto';

@Controller('hotels/:hotelId/services')
@UseGuards(TenantGuard)
export class ServiceCatalogController {
  constructor(private readonly catalogService: ServiceCatalogService) {}

  @Public()
  @Get()
  findAll(
    @Param('hotelId') hotelId: string,
    @Query('category') category?: string,
  ) {
    return this.catalogService.findAll(hotelId, category);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.catalogService.findOne(id);
  }

  @Post()
  create(
    @Param('hotelId') hotelId: string,
    @Body(new ZodValidationPipe(createServiceItemSchema))
    dto: CreateServiceItemDto,
  ) {
    return this.catalogService.create(hotelId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateServiceItemSchema))
    dto: UpdateServiceItemDto,
  ) {
    return this.catalogService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.catalogService.remove(id);
  }
}
