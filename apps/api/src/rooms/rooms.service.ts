import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.room.findMany();
  }

  async findOne(id: string) {
    const room = await this.prisma.tenant.room.findUnique({ where: { id } });
    if (!room) throw new NotFoundException('Room not found');
    return room;
  }

  async create(hotelId: string, dto: CreateRoomDto) {
    return this.prisma.tenant.room.create({
      data: { ...dto, hotelId },
    });
  }

  async update(id: string, dto: UpdateRoomDto) {
    await this.findOne(id);
    return this.prisma.tenant.room.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.room.delete({ where: { id } });
  }
}
