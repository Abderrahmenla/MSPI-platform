import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateQuoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  serviceType!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  propertyType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  surfaceOrRooms?: string;

  @IsBoolean()
  hasElectrical!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  freeText?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  @MaxLength(20)
  phone!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  city!: string;
}
