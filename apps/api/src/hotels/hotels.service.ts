import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateHotelDto, UpdateHotelDto } from './dto/hotel.dto';

@Injectable()
export class HotelsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.hotel.findMany();
  }

  async findOne(id: string) {
    const hotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!hotel) throw new NotFoundException('Hotel not found');
    return hotel;
  }

  async create(dto: CreateHotelDto) {
    return this.prisma.hotel.create({ data: dto });
  }

  async update(id: string, dto: UpdateHotelDto) {
    await this.findOne(id);
    return this.prisma.hotel.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.hotel.delete({ where: { id } });
  }
}
