import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutPurgeService } from '../queues/checkout-purge.service';
import { CreateExtensionDto, RejectExtensionDto } from './dto/extension.dto';

@Injectable()
export class ExtensionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkoutPurge: CheckoutPurgeService,
  ) {}

  async create(
    hotelId: string,
    reservationId: string,
    dto: CreateExtensionDto,
  ) {
    const reservation = await this.prisma.tenant.reservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }

    if (reservation.status !== 'CHECKED_IN') {
      throw new BadRequestException(
        'Extension can only be requested for checked-in reservations',
      );
    }

    return this.prisma.tenant.stayExtension.create({
      data: {
        reservationId,
        hotelId,
        newCheckOut: dto.newCheckOut,
        reason: dto.reason,
      },
    });
  }

  async findByHotel(hotelId: string, status?: string) {
    const where: Record<string, unknown> = { hotelId };
    if (status) where.status = status;

    return this.prisma.tenant.stayExtension.findMany({
      where,
      include: { reservation: { include: { room: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByReservation(reservationId: string) {
    return this.prisma.tenant.stayExtension.findMany({
      where: { reservationId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string) {
    const extension = await this.prisma.tenant.stayExtension.findUnique({
      where: { id },
      include: { reservation: true },
    });

    if (!extension) {
      throw new NotFoundException('Stay extension not found');
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.tenant.stayExtension.update({
        where: { id },
        data: { status: 'APPROVED' },
      }),
      this.prisma.tenant.reservation.update({
        where: { id: extension.reservationId },
        data: { checkOut: extension.newCheckOut },
      }),
    ]);

    // Reschedule purge job: cancel old, schedule new
    await this.checkoutPurge.cancelCheckoutPurge(extension.reservationId);
    await this.checkoutPurge.scheduleCheckoutPurge(
      extension.reservationId,
      extension.newCheckOut,
    );

    return updated;
  }

  async reject(id: string, dto: RejectExtensionDto) {
    const extension = await this.prisma.tenant.stayExtension.findUnique({
      where: { id },
    });

    if (!extension) {
      throw new NotFoundException('Stay extension not found');
    }

    return this.prisma.tenant.stayExtension.update({
      where: { id },
      data: { status: 'REJECTED', rejectionNote: dto.rejectionNote },
    });
  }
}
