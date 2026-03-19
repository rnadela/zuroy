import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateAmenityDto, UpdateAmenityDto } from './dto/amenity.dto';

@Injectable()
export class AmenitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(hotelId: string, dto: CreateAmenityDto) {
    return this.prisma.tenant.amenity.create({
      data: { ...dto, hotelId },
    });
  }

  async findAll(hotelId: string, category?: string) {
    return this.prisma.tenant.amenity.findMany({
      where: {
        hotelId,
        ...(category ? { category } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const amenity = await this.prisma.tenant.amenity.findUnique({
      where: { id },
    });
    if (!amenity) throw new NotFoundException('Amenity not found');
    return amenity;
  }

  async update(id: string, dto: UpdateAmenityDto) {
    await this.findOne(id);
    return this.prisma.tenant.amenity.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.amenity.delete({ where: { id } });
  }
}
