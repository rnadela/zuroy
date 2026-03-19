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
  UsePipes,
} from '@nestjs/common';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { Public } from '../auth/decorators/public.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { AmenitiesService } from './amenities.service';
import { createAmenitySchema, updateAmenitySchema } from './dto/amenity.dto';
import type { CreateAmenityDto, UpdateAmenityDto } from './dto/amenity.dto';

@Controller('hotels/:hotelId/amenities')
@UseGuards(TenantGuard)
export class AmenitiesController {
  constructor(private readonly amenitiesService: AmenitiesService) {}

  @Public()
  @Get()
  findAll(
    @Param('hotelId') hotelId: string,
    @Query('category') category?: string,
  ) {
    return this.amenitiesService.findAll(hotelId, category);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.amenitiesService.findOne(id);
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createAmenitySchema))
  create(@Param('hotelId') hotelId: string, @Body() dto: CreateAmenityDto) {
    return this.amenitiesService.create(hotelId, dto);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateAmenitySchema))
  update(@Param('id') id: string, @Body() dto: UpdateAmenityDto) {
    return this.amenitiesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.amenitiesService.remove(id);
  }
}
