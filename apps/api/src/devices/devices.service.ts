import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreateDeviceDto,
  AssignDeviceDto,
  HeartbeatDto,
} from './dto/device.dto';

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
    return this.prisma.device.findMany({
      where: hotelId ? { hotelId } : undefined,
    });
  }

  async findOne(id: string) {
    const device = await this.prisma.device.findUnique({ where: { id } });
    if (!device) throw new NotFoundException('Device not found');
    return device;
  }

  async assign(id: string, dto: AssignDeviceDto) {
    await this.findOne(id);
    return this.prisma.device.update({
      where: { id },
      data: { hotelId: dto.hotelId, status: 'ASSIGNED' },
    });
  }

  async unassign(id: string) {
    await this.findOne(id);
    return this.prisma.device.update({
      where: { id },
      data: { hotelId: null, status: 'UNASSIGNED' },
    });
  }

  async heartbeat(id: string, dto: HeartbeatDto, deviceToken: string) {
    const device = await this.findOne(id);

    if (!device.enrollmentCode) {
      throw new UnauthorizedException('Device has no enrollment code');
    }

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
    // Find all devices to verify token (no index on raw token)
    const devices = await this.prisma.device.findMany({
      where: { enrollmentCode: { not: null } },
    });

    const device = await this.findDeviceByToken(devices, deviceToken);
    if (!device) throw new UnauthorizedException('Invalid device token');

    const reservation = await this.prisma.reservation.findFirst({
      where: {
        provisioningToken,
        provisioningTokenExpiresAt: { gt: new Date() },
        deviceId: null,
      },
      include: {
        room: true,
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true,
            backgroundUrl: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException('Invalid or expired provisioning token');
    }

    const updated = await this.prisma.reservation.update({
      where: { id: reservation.id },
      data: {
        deviceId: device.id,
        provisioningToken: null,
        provisioningTokenExpiresAt: null,
      },
      include: {
        room: true,
        hotel: {
          select: {
            id: true,
            name: true,
            slug: true,
            logoUrl: true,
            primaryColor: true,
            secondaryColor: true,
            backgroundUrl: true,
          },
        },
      },
    });

    return updated;
  }

  private async findDeviceByToken(
    devices: { id: string; enrollmentCode: string | null }[],
    token: string,
  ) {
    for (const device of devices) {
      if (!device.enrollmentCode) continue;
      const match = await bcrypt.compare(token, device.enrollmentCode);
      if (match) return device;
    }
    return null;
  }
}
