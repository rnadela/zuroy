import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  UsePipes,
} from '@nestjs/common';
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
import type { Request } from 'express';

@Controller('devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesService) {}

  @Roles('SUPER_ADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(createDeviceSchema))
  create(@Body() dto: CreateDeviceDto) {
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
  @UsePipes(new ZodValidationPipe(assignDeviceSchema))
  assign(@Param('id') id: string, @Body() dto: AssignDeviceDto) {
    return this.devicesService.assign(id, dto);
  }

  @Roles('SUPER_ADMIN')
  @Post(':id/unassign')
  unassign(@Param('id') id: string) {
    return this.devicesService.unassign(id);
  }

  @Public()
  @Post(':id/heartbeat')
  @UsePipes(new ZodValidationPipe(heartbeatSchema))
  heartbeat(
    @Param('id') id: string,
    @Body() dto: HeartbeatDto,
    @Req() req: Request,
  ) {
    const deviceToken = req.headers['x-device-token'] as string;
    return this.devicesService.heartbeat(id, dto, deviceToken);
  }

  @Public()
  @Post('provision')
  @UsePipes(new ZodValidationPipe(provisionSchema))
  provision(@Body() dto: ProvisionDto, @Req() req: Request) {
    const deviceToken = req.headers['x-device-token'] as string;
    return this.devicesService.provision(dto.provisioningToken, deviceToken);
  }
}
