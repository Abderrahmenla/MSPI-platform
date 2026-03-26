import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsPositive,
  ValidateNested,
} from 'class-validator';

class MergeCartItemDto {
  @IsInt()
  @IsPositive()
  @Type(() => Number)
  productId!: number;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  qty!: number;
}

export class MergeCartDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => MergeCartItemDto)
  items!: MergeCartItemDto[];
}
