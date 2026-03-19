import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateServiceRequestDto,
  UpdateRequestStatusDto,
} from './dto/service.dto';

@Injectable()
export class ServiceRequestsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    hotelId: string,
    reservationId: string,
    dto: CreateServiceRequestDto,
  ) {
    const item = await this.prisma.tenant.serviceItem.findUnique({
      where: { id: dto.itemId },
    });
    if (!item) throw new NotFoundException('Service item not found');

    const chargeAmount = Number(item.price) * dto.quantity;

    return this.prisma.tenant.serviceRequest.create({
      data: {
        reservationId,
        itemId: dto.itemId,
        quantity: dto.quantity,
        notes: dto.notes,
        chargeAmount,
        hotelId,
      },
      include: { item: true },
    });
  }

  async findByHotel(hotelId: string, status?: string) {
    return this.prisma.tenant.serviceRequest.findMany({
      where: {
        hotelId,
        ...(status ? { status: status as any } : {}),
      },
      include: {
        reservation: true,
        item: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, dto: UpdateRequestStatusDto) {
    const request = await this.prisma.tenant.serviceRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Service request not found');

    return this.prisma.tenant.serviceRequest.update({
      where: { id },
      data: { status: dto.status },
      include: { item: true },
    });
  }

  async getCharges(reservationId: string) {
    const [aggregate, requests] = await Promise.all([
      this.prisma.tenant.serviceRequest.aggregate({
        where: { reservationId },
        _sum: { chargeAmount: true },
      }),
      this.prisma.tenant.serviceRequest.findMany({
        where: { reservationId },
        include: { item: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      total: aggregate._sum.chargeAmount ?? 0,
      requests,
    };
  }
}
