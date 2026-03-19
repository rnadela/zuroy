import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
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
  @UsePipes(new ZodValidationPipe(createRoomSchema))
  create(@Param('hotelId') hotelId: string, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(hotelId, dto);
  }

  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateRoomSchema))
  update(@Param('id') id: string, @Body() dto: UpdateRoomDto) {
    return this.roomsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roomsService.remove(id);
  }
}
