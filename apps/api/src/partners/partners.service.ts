import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@zuroy/database';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CreatePartnerDto,
  UpdatePartnerDto,
  PartnerQuery,
} from './dto/partner.dto';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PartnerQuery) {
    if (query.lat !== undefined && query.lng !== undefined) {
      return this.findNearby(
        query.lat,
        query.lng,
        query.radius ?? 100,
        query.category,
      );
    }

    return this.prisma.partner.findMany({
      where: {
        ...(query.category ? { category: query.category } : {}),
        ...(query.boosted !== undefined ? { boosted: query.boosted } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findNearby(
    lat: number,
    lng: number,
    radiusKm: number,
    category?: string,
  ) {
    const latDelta = radiusKm / 111.0;
    const lngDelta = radiusKm / (111.0 * Math.cos((lat * Math.PI) / 180));

    return this.prisma.$queryRaw<any[]>(Prisma.sql`
      SELECT *,
        6371 * 2 * ASIN(SQRT(
          POWER(SIN(RADIANS(latitude - ${lat}) / 2), 2) +
          COS(RADIANS(${lat})) * COS(RADIANS(latitude)) *
          POWER(SIN(RADIANS(longitude - ${lng}) / 2), 2)
        )) AS "distanceKm"
      FROM "Partner"
      WHERE latitude BETWEEN ${lat - latDelta} AND ${lat + latDelta}
        AND longitude BETWEEN ${lng - lngDelta} AND ${lng + lngDelta}
        AND 6371 * 2 * ASIN(SQRT(
          POWER(SIN(RADIANS(latitude - ${lat}) / 2), 2) +
          COS(RADIANS(${lat})) * COS(RADIANS(latitude)) *
          POWER(SIN(RADIANS(longitude - ${lng}) / 2), 2)
        )) <= ${radiusKm}
        ${category ? Prisma.sql`AND category = ${category}` : Prisma.empty}
      ORDER BY "distanceKm"
    `);
  }

  async findBoosted(region?: string) {
    return this.prisma.partner.findMany({
      where: {
        boosted: true,
        ...(region ? { boostRegion: region } : {}),
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const partner = await this.prisma.partner.findUnique({ where: { id } });
    if (!partner) throw new NotFoundException('Partner not found');
    return partner;
  }

  async create(dto: CreatePartnerDto) {
    return this.prisma.partner.create({ data: dto });
  }

  async update(id: string, dto: UpdatePartnerDto) {
    await this.findOne(id);
    return this.prisma.partner.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.partner.delete({ where: { id } });
  }
}
