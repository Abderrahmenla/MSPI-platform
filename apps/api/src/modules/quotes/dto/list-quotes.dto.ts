import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min, Max } from 'class-validator';
import { QuoteStatus } from '@prisma/client';

export class ListQuotesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @IsOptional()
  @IsEnum(QuoteStatus)
  status?: QuoteStatus;
}
