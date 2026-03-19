import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateServiceItemDto,
  UpdateServiceItemDto,
} from './dto/service.dto';

@Injectable()
export class ServiceCatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async create(hotelId: string, dto: CreateServiceItemDto) {
    return this.prisma.tenant.serviceItem.create({
      data: { ...dto, hotelId },
    });
  }

  async findAll(hotelId: string, category?: string) {
    return this.prisma.tenant.serviceItem.findMany({
      where: {
        hotelId,
        ...(category ? { category } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const item = await this.prisma.tenant.serviceItem.findUnique({
      where: { id },
    });
    if (!item) throw new NotFoundException('Service item not found');
    return item;
  }

  async update(id: string, dto: UpdateServiceItemDto) {
    await this.findOne(id);
    return this.prisma.tenant.serviceItem.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.tenant.serviceItem.delete({ where: { id } });
  }
}
