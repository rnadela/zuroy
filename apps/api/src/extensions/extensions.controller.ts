import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import {
  CreateExtensionDto,
  RejectExtensionDto,
  createExtensionSchema,
  rejectExtensionSchema,
} from './dto/extension.dto';
import { ExtensionsService } from './extensions.service';

@Controller('hotels/:hotelId')
@UseGuards(TenantGuard)
export class ExtensionsController {
  constructor(private readonly extensions: ExtensionsService) {}

  @Post('reservations/:reservationId/extensions')
  create(
    @Param('hotelId') hotelId: string,
    @Param('reservationId') reservationId: string,
    @Body(new ZodValidationPipe(createExtensionSchema))
    dto: CreateExtensionDto,
  ) {
    return this.extensions.create(hotelId, reservationId, dto);
  }

  @Get('extensions')
  findByHotel(
    @Param('hotelId') hotelId: string,
    @Query('status') status?: string,
  ) {
    return this.extensions.findByHotel(hotelId, status);
  }

  @Get('reservations/:reservationId/extensions')
  findByReservation(@Param('reservationId') reservationId: string) {
    return this.extensions.findByReservation(reservationId);
  }

  @Post('extensions/:id/approve')
  approve(@Param('id') id: string) {
    return this.extensions.approve(id);
  }

  @Post('extensions/:id/reject')
  reject(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(rejectExtensionSchema))
    dto: RejectExtensionDto,
  ) {
    return this.extensions.reject(id, dto);
  }
}
