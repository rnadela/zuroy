import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { ServiceRequestsService } from './service-requests.service';
import {
  createServiceRequestSchema,
  updateRequestStatusSchema,
} from './dto/service.dto';
import type {
  CreateServiceRequestDto,
  UpdateRequestStatusDto,
} from './dto/service.dto';

@Controller('hotels/:hotelId')
@UseGuards(TenantGuard)
export class ServiceRequestsController {
  constructor(private readonly requestsService: ServiceRequestsService) {}

  @Post('reservations/:reservationId/requests')
  @UsePipes(new ZodValidationPipe(createServiceRequestSchema))
  create(
    @Param('hotelId') hotelId: string,
    @Param('reservationId') reservationId: string,
    @Body() dto: CreateServiceRequestDto,
  ) {
    return this.requestsService.create(hotelId, reservationId, dto);
  }

  @Get('requests')
  findByHotel(
    @Param('hotelId') hotelId: string,
    @Query('status') status?: string,
  ) {
    return this.requestsService.findByHotel(hotelId, status);
  }

  @Patch('requests/:id/status')
  @UsePipes(new ZodValidationPipe(updateRequestStatusSchema))
  updateStatus(@Param('id') id: string, @Body() dto: UpdateRequestStatusDto) {
    return this.requestsService.updateStatus(id, dto);
  }

  @Get('reservations/:reservationId/charges')
  getCharges(@Param('reservationId') reservationId: string) {
    return this.requestsService.getCharges(reservationId);
  }
}
