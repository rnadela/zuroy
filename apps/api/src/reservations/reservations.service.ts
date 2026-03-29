import * as crypto from 'crypto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CheckoutPurgeService } from '../queues/checkout-purge.service';
import {
  CheckInDto,
  CreateReservationDto,
  UpdateReservationDto,
} from './dto/reservation.dto';

@Injectable()
export class ReservationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly checkoutPurge: CheckoutPurgeService,
  ) {}

  async findAll(
    hotelId: string,
    query?: { cursor?: string; status?: string; from?: string; to?: string },
  ) {
    const where: Record<string, unknown> = { hotelId };

    if (query?.status) {
      where.status = query.status;
    }
    if (query?.from || query?.to) {
      where.checkIn = {
        ...(query.from && { gte: new Date(query.from) }),
        ...(query.to && { lte: new Date(query.to) }),
      };
    }

    return this.prisma.tenant.reservation.findMany({
      where,
      take: 25,
      ...(query?.cursor && {
        skip: 1,
        cursor: { id: query.cursor },
      }),
      orderBy: { checkIn: 'asc' },
    });
  }

  async findOne(id: string) {
    const reservation = await this.prisma.tenant.reservation.findUnique({
      where: { id },
      include: { room: true },
    });
    if (!reservation) {
      throw new NotFoundException('Reservation not found');
    }
    return reservation;
  }

  async create(hotelId: string, dto: CreateReservationDto) {
    return this.prisma.tenant.reservation.create({
      data: { ...dto, hotelId },
    });
  }

  async update(id: string, dto: UpdateReservationDto) {
    await this.findOne(id);
    return this.prisma.tenant.reservation.update({
      where: { id },
      data: dto,
    });
  }

  async checkIn(id: string, dto: CheckInDto) {
    const reservation = await this.findOne(id);

    if (reservation.status !== 'PENDING') {
      throw new BadRequestException('Reservation is not in PENDING status');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const updated = await this.prisma.tenant.reservation.update({
      where: { id },
      data: {
        status: 'CHECKED_IN',
        deviceId: dto.deviceId,
        provisioningToken: hashedToken,
        provisioningTokenExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
      },
    });

    await this.checkoutPurge.scheduleCheckoutPurge(id, updated.checkOut);

    return { provisioningToken: rawToken };
  }

  async checkOut(id: string) {
    const reservation = await this.findOne(id);

    if (reservation.status !== 'CHECKED_IN') {
      throw new BadRequestException('Reservation is not in CHECKED_IN status');
    }

    await this.checkoutPurge.cancelCheckoutPurge(id);

    return this.prisma.tenant.reservation.update({
      where: { id },
      data: {
        status: 'CHECKED_OUT',
        provisioningToken: null,
        provisioningTokenExpiresAt: null,
        deviceId: null,
      },
    });
  }
}
