import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateIf,
} from 'class-validator';

export class CreateNoteDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body!: string;

  @IsOptional()
  @IsUUID()
  orderUuid?: string;

  @IsOptional()
  @IsUUID()
  quoteUuid?: string;

  @IsOptional()
  @IsUUID()
  customerUuid?: string;
}
