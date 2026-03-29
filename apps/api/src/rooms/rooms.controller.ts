import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { TenantGuard } from '../auth/guards/tenant.guard';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import {
  createRoomSchema,
  updateRoomSchema,
  type CreateRoomDto,
  type UpdateRoomDto,
} from './dto/room.dto';

@Controller('hotels/:hotelId/rooms')
@UseGuards(TenantGuard)
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Post()
  create(
    @Param('hotelId') hotelId: string,
    @Body(new ZodValidationPipe(createRoomSchema)) dto: CreateRoomDto,
  ) {
    return this.roomsService.create(hotelId, dto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateRoomSchema)) dto: UpdateRoomDto,
  ) {
    return this.roomsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
