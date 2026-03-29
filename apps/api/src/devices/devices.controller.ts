import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { DevicesService } from './devices.service';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import {
  createDeviceSchema,
  assignDeviceSchema,
  heartbeatSchema,
  provisionSchema,
} from './dto/device.dto';
import type {
  CreateDeviceDto,
  AssignDeviceDto,
  HeartbeatDto,
  ProvisionDto,
} from './dto/device.dto';
import { updateDataUsageSchema } from './dto/hotspot.dto';
import type { UpdateDataUsageDto } from './dto/hotspot.dto';
import type { Request } from 'express';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Roles('SUPER_ADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(createDeviceSchema)) dto: CreateDeviceDto,
  ) {
    return this.devicesService.create(dto);
  }

  @Get()
  findAll(@Query('hotelId') hotelId?: string) {
    return this.devicesService.findAll(hotelId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.devicesService.findOne(id);
  }

  @Roles('SUPER_ADMIN')
  @Post(':id/assign')
  assign(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(assignDeviceSchema)) dto: AssignDeviceDto,
  ) {
    return this.devicesService.assign(id, dto);
  }

  @Roles('SUPER_ADMIN')
  @Post(':id/unassign')
  unassign(@Param('id') id: string) {
    return this.devicesService.unassign(id);
  }

  @Public()
  @Post(':id/heartbeat')
  heartbeat(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(heartbeatSchema)) dto: HeartbeatDto,
    @Req() req: Request,
  ) {
    const deviceToken = req.headers['x-device-token'] as string;
    return this.devicesService.heartbeat(id, dto, deviceToken);
  }

  @Public()
  @Post(':id/data-usage')
  dataUsage(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateDataUsageSchema)) dto: UpdateDataUsageDto,
    @Req() req: Request,
  ) {
    const deviceToken = req.headers['x-device-token'] as string;
    return this.devicesService.updateDataUsage(id, dto.dataUsedMb, deviceToken);
  }

  @Public()
  @Post('provision')
  provision(
    @Body(new ZodValidationPipe(provisionSchema)) dto: ProvisionDto,
    @Req() req: Request,
  ) {
    const deviceToken = req.headers['x-device-token'] as string;
    return this.devicesService.provision(dto.provisioningToken, deviceToken);
  }
}
