import { plainToInstance } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  validateSync,
} from 'class-validator';

export class EnvironmentVariables {
  // ─── Database ─────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  // ─── Facebook OAuth ──────────────────────────────────
  @IsString()
  @IsOptional()
  FACEBOOK_APP_ID?: string;

  @IsString()
  @IsOptional()
  FACEBOOK_APP_SECRET?: string;

  @IsString()
  @IsOptional()
  FACEBOOK_CALLBACK_URL?: string;

  // ─── JWT ─────────────────────────────────────────────
  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_ADMIN_SECRET!: string;

  @IsString()
  @IsOptional()
  JWT_CUSTOMER_EXPIRY?: string = '24h';

  @IsString()
  @IsOptional()
  JWT_ADMIN_EXPIRY?: string = '60m';

  // ─── App URLs (CORS whitelist) ───────────────────────
  @IsUrl({ require_tld: false })
  @IsOptional()
  WEB_URL?: string = 'http://localhost:3000';

  @IsUrl({ require_tld: false })
  @IsOptional()
  ADMIN_URL?: string = 'http://localhost:3001';

  // ─── Server ──────────────────────────────────────────
  @IsNumber()
  @IsOptional()
  @Min(1)
  PORT?: number = 4000;

  // ─── File uploads ────────────────────────────────────
  @IsString()
  @IsOptional()
  UPLOAD_DIR?: string = './uploads';

  @IsNumber()
  @IsOptional()
  @Min(1)
  MAX_FILE_SIZE?: number = 5242880;

  // ─── Rate limiting ───────────────────────────────────
  @IsNumber()
  @IsOptional()
  @Min(1)
  THROTTLE_TTL?: number = 60;

  @IsNumber()
  @IsOptional()
  @Min(1)
  THROTTLE_LIMIT?: number = 100;
}

export function validate(
  config: Record<string, unknown>,
): EnvironmentVariables {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Environment validation failed:\n${errors.map((e) => `  - ${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`).join('\n')}`,
    );
  }

  return validatedConfig;
}
