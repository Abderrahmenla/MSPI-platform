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

export class UpdateProductDto {
  @IsString()
  @MaxLength(100)
  @IsOptional()
  sku?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  slug?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  nameAr?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  nameFr?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  nameEn?: string;

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
  @IsOptional()
  @Type(() => Number)
  price?: number;

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
