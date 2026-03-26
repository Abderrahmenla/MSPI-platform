import {
  IsNotEmpty,
  IsString,
  IsUUID,
  MinLength,
  MaxLength,
  ValidateNested,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  address!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  label?: string;
}

export class CreateOrderDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  phone!: string;

  @ValidateNested()
  @Type(() => AddressDto)
  address!: AddressDto;

  @IsUUID()
  @IsNotEmpty()
  idempotencyKey!: string;

  @IsOptional()
  @IsString()
  quoteRef?: string;
}
