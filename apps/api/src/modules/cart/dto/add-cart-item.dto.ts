import { IsInt, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class AddCartItemDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  productId!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  qty!: number;
}
