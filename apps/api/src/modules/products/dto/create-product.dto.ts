import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @MaxLength(100)
  sku!: string;

  @IsString()
  @MaxLength(200)
  slug!: string;

  @IsString()
  @MaxLength(200)
  nameAr!: string;

  @IsString()
  @MaxLength(200)
  nameFr!: string;

  @IsString()
  @MaxLength(200)
  nameEn!: string;

  @IsString()
  @IsOptional()
  descAr?: string;

  @IsString()
  @IsOptional()
  descFr?: string;

  @IsString()
  @IsOptional()
  descEn?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  stock?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  threshold?: number;

  @IsBoolean()
  @IsOptional()
  active?: boolean;
}
