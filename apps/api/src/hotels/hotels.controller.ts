import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { HotelsService } from './hotels.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import {
  createHotelSchema,
  updateHotelSchema,
  type CreateHotelDto,
  type UpdateHotelDto,
} from './dto/hotel.dto';

@Controller('hotels')
export class HotelsController {
  constructor(private readonly hotelsService: HotelsService) {}

  @Roles('SUPER_ADMIN')
  @Get()
  findAll() {
    return this.hotelsService.findAll();
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { role: string; hotelId?: string } },
  ) {
    // HOTEL_STAFF can only view their own hotel
    if (req.user.role !== 'SUPER_ADMIN' && req.user.hotelId !== id) {
      throw new ForbiddenException('Access denied');
    }
    return this.hotelsService.findOne(id);
  }

  @Roles('SUPER_ADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(createHotelSchema))
  create(@Body() dto: CreateHotelDto) {
    return this.hotelsService.create(dto);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateHotelSchema))
  update(@Param('id') id: string, @Body() dto: UpdateHotelDto) {
    return this.hotelsService.update(id, dto);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.hotelsService.remove(id);
  }
}
