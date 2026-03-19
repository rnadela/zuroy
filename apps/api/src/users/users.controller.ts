import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UsePipes,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { ZodValidationPipe } from '../auth/pipes/zod-validation.pipe';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserDto,
  type UpdateUserDto,
} from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Req() req: { user: { role: string; hotelId?: string } }) {
    return this.usersService.findAll(req.user);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: { user: { id: string; role: string; hotelId?: string } },
  ) {
    const user = await this.usersService.findOne(id);
    // HOTEL_STAFF can only view own profile or same-hotel users
    if (req.user.role !== 'SUPER_ADMIN' && user.hotelId !== req.user.hotelId) {
      throw new ForbiddenException('Access denied');
    }
    return user;
  }

  @Roles('SUPER_ADMIN')
  @Post()
  @UsePipes(new ZodValidationPipe(createUserSchema))
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Roles('SUPER_ADMIN')
  @Patch(':id')
  @UsePipes(new ZodValidationPipe(updateUserSchema))
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
