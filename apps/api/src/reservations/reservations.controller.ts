import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import {
  CheckInDto,
  CreateReservationDto,
  UpdateReservationDto,
  checkInSchema,
  createReservationSchema,
  updateReservationSchema,
} from './dto/reservation.dto';
import { ReservationsService } from './reservations.service';

@Controller('hotels/:hotelId/reservations')
@UseGuards(TenantGuard)
export class ReservationsController {
  constructor(private readonly reservations: ReservationsService) {}

  @Post()
  @UsePipes(new ZodValidationPipe(createReservationSchema))
  create(@Param('hotelId') hotelId: string, @Body() dto: CreateReservationDto) {
    return this.reservations.create(hotelId, dto);
  }

  @Get()
  findAll(
    @Param('hotelId') hotelId: string,
    @Query('cursor') cursor?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.reservations.findAll(hotelId, { cursor, status, from, to });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reservations.findOne(id);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateReservationSchema))
  update(@Param('id') id: string, @Body() dto: UpdateReservationDto) {
    return this.reservations.update(id, dto);
  }

  @Post(':id/check-in')
  @UsePipes(new ZodValidationPipe(checkInSchema))
  checkIn(@Param('id') id: string, @Body() dto: CheckInDto) {
    return this.reservations.checkIn(id, dto);
  }

  @Post(':id/check-out')
  checkOut(@Param('id') id: string) {
    return this.reservations.checkOut(id);
  }
}
