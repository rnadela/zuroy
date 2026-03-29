import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import { PartnersService } from './partners.service';
import {
  createPartnerSchema,
  updatePartnerSchema,
  partnerQuerySchema,
} from './dto/partner.dto';
import type {
  CreatePartnerDto,
  UpdatePartnerDto,
  PartnerQuery,
} from './dto/partner.dto';

@Controller('partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Public()
  @Get()
  findAll(
    @Query(new ZodValidationPipe(partnerQuerySchema)) query: PartnerQuery,
  ) {
    return this.partnersService.findAll(query);
  }

  @Public()
  @Get('boosted')
  findBoosted(@Query('region') region?: string) {
    return this.partnersService.findBoosted(region);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partnersService.findOne(id);
  }

  @Roles('SUPER_ADMIN')
  @Post()
  create(
    @Body(new ZodValidationPipe(createPartnerSchema)) dto: CreatePartnerDto,
  ) {
    return this.partnersService.create(dto);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePartnerSchema)) dto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(id, dto);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partnersService.remove(id);
  }
}
