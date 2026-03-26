import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddressDto {
  @IsString()
  @IsOptional()
  @MaxLength(50)
  label?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
