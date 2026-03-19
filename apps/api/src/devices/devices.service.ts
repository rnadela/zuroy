import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateDeviceDto,
  AssignDeviceDto,
  HeartbeatDto,
} from './dto/device.dto';

const HOTEL_SELECT = {
  id: true,
  name: true,
  slug: true,
  logoUrl: true,
  primaryColor: true,
  secondaryColor: true,
  backgroundUrl: true,
} as const;

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDeviceDto) {
    const rawApiKey = crypto.randomBytes(32).toString('hex');
    const hashedKey = await bcrypt.hash(rawApiKey, 10);

    const device = await this.prisma.device.create({
      data: {
        serialNumber: dto.serialNumber,
        deviceModel: dto.deviceModel,
        enrollmentCode: hashedKey,
      },
    });

    return { ...device, apiKey: rawApiKey };
  }

  async findAll(hotelId?: string) {
    return this.prisma.tenant.device.findMany({
      where: hotelId ? { hotelId } : undefined,
    });
  }

  async findOne(id: string) {
    const device = await this.prisma.tenant.device.findUnique({
      where: { id },
    });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async assign(id: string, dto: AssignDeviceDto) {
    return this.prisma.device.update({
      where: { id },
      data: { hotelId: dto.hotelId, status: 'ASSIGNED' },
    });
  }

  async unassign(id: string) {
    return this.prisma.device.update({
      where: { id },
      data: { hotelId: null, status: 'UNASSIGNED' },
    });
  }

  async heartbeat(id: string, dto: HeartbeatDto, deviceToken: string) {
    if (!deviceToken) throw new UnauthorizedException('Device token required');

    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) throw new NotFoundException('Device not found');
    if (!device.enrollmentCode)
      throw new UnauthorizedException('Device has no enrollment code');

    const valid = await bcrypt.compare(deviceToken, device.enrollmentCode);
    if (!valid) throw new UnauthorizedException('Invalid device token');

    return this.prisma.device.update({
      where: { id },
      data: {
        lastHeartbeat: new Date(),
        batteryLevel: dto.batteryLevel,
        appVersion: dto.appVersion,
      },
    });
  }

  async provision(provisioningToken: string, deviceToken: string) {
    if (!deviceToken) throw new UnauthorizedException('Device token required');

    // Find device by token (bcrypt compare against all enrolled devices)
    const devices = await this.prisma.device.findMany({
      where: { enrollmentCode: { not: null } },
    });

    let matchedDevice: (typeof devices)[0] | null = null;
    for (const d of devices) {
      if (!d.enrollmentCode) continue;
      if (await bcrypt.compare(deviceToken, d.enrollmentCode)) {
        matchedDevice = d;
        break;
      }
    }
    if (!matchedDevice) throw new UnauthorizedException('Invalid device token');

    // Hash the provisioning token to match stored hash
    const tokenHash = crypto
      .createHash('sha256')
      .update(provisioningToken)
      .digest('hex');

    // Atomic: find reservation with matching hashed token
    const reservation = await this.prisma.reservation.findFirst({
      where: {
        provisioningToken: tokenHash,
        provisioningTokenExpiresAt: { gt: new Date() },
        deviceId: null,
      },
      include: { room: true, hotel: { select: HOTEL_SELECT } },
    });

    if (!reservation)
      throw new NotFoundException('Invalid or expired provisioning token');

    // Cross-tenant check: device must belong to same hotel as reservation
    if (matchedDevice.hotelId !== reservation.hotelId) {
      throw new ForbiddenException('Device does not belong to this hotel');
    }

    // Atomically consume token + bind device
    return this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        deviceId: matchedDevice.id,
        provisioningToken: null,
        provisioningTokenExpiresAt: null,
      },
      include: { room: true, hotel: { select: HOTEL_SELECT } },
    });
  }
}
