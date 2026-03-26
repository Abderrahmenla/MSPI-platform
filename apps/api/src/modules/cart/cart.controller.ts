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
import { CartService } from './cart.service';
import { AddCartItemDto } from './dto/add-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { MergeCartDto } from './dto/merge-cart.dto';

@Controller('customer/cart')
@UseGuards(CustomerAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  getCart(@CurrentUser() user: User) {
    return this.cartService.getCart(user);
  }

  @Post('items')
  addItem(@CurrentUser() user: User, @Body() dto: AddCartItemDto) {
    return this.cartService.addItem(user, dto);
  }

  @Patch('items/:id')
  updateItem(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCartItemDto,
  ) {
    return this.cartService.updateItem(user, BigInt(id), dto);
  }

  @Delete('items/:id')
  removeItem(@CurrentUser() user: User, @Param('id') id: string) {
    return this.cartService.removeItem(user, BigInt(id));
  }

  @Post('merge')
  mergeCart(@CurrentUser() user: User, @Body() dto: MergeCartDto) {
    return this.cartService.mergeCart(user, dto);
  }
}
