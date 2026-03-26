import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { User } from '@prisma/client';

import { CustomerAuthGuard } from '../auth/guards/customer-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Controller('customer')
@UseGuards(CustomerAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ─── Profile ────────────────────────────────────────

  @Get('profile')
  getProfile(@CurrentUser() user: User) {
    return this.usersService.getProfile(user);
  }

  @Patch('profile')
  updateProfile(@CurrentUser() user: User, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user, dto);
  }

  // ─── Addresses ──────────────────────────────────────

  @Get('addresses')
  getAddresses(@CurrentUser() user: User) {
    return this.usersService.getAddresses(user);
  }

  @Post('addresses')
  createAddress(@CurrentUser() user: User, @Body() dto: CreateAddressDto) {
    return this.usersService.createAddress(user, dto);
  }

  @Patch('addresses/:id')
  updateAddress(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateAddressDto,
  ) {
    return this.usersService.updateAddress(user, BigInt(id), dto);
  }

  @Delete('addresses/:id')
  deleteAddress(@CurrentUser() user: User, @Param('id') id: string) {
    return this.usersService.deleteAddress(user, BigInt(id));
  }
}
