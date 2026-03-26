import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { Request, Response } from 'express';

interface ErrorEnvelope {
  statusCode: number;
  message: string;
  error: string;
}

const PRISMA_ERROR_MAP: Record<
  string,
  { status: HttpStatus; message: string }
> = {
  P2025: { status: HttpStatus.NOT_FOUND, message: 'Record not found' },
  P2002: {
    status: HttpStatus.CONFLICT,
    message: 'Unique constraint violation',
  },
  P2003: {
    status: HttpStatus.BAD_REQUEST,
    message: 'Foreign key constraint violation',
  },
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);
  private readonly isProduction = process.env['NODE_ENV'] === 'production';

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { statusCode, message, error } = this.resolveError(exception);

    this.logError(exception, request, statusCode);

    const body: ErrorEnvelope = { statusCode, message, error };
    response.status(statusCode).json(body);
  }

  private resolveError(exception: unknown): ErrorEnvelope {
    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'string'
          ? res
          : ((res as { message?: string }).message ?? exception.message);
      const error = String(
        HttpStatus[statusCode as unknown as keyof typeof HttpStatus] ??
          'Unknown Error',
      );
      return { statusCode, message: String(message), error };
    }

    if (exception instanceof PrismaClientKnownRequestError) {
      const mapped = PRISMA_ERROR_MAP[exception.code];
      if (mapped) {
        return {
          statusCode: mapped.status,
          message: mapped.message,
          error: String(
            HttpStatus[mapped.status as unknown as keyof typeof HttpStatus] ??
              'Error',
          ),
        };
      }
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }

  private logError(
    exception: unknown,
    request: Request,
    statusCode: number,
  ): void {
    const method = request.method;
    const url = request.url;
    const context = `${method} ${url} → ${statusCode}`;

    if (statusCode >= 500) {
      const stack =
        !this.isProduction && exception instanceof Error
          ? exception.stack
          : undefined;
      this.logger.error(context, stack);
    } else {
      const message =
        exception instanceof Error ? exception.message : String(exception);
      this.logger.warn(`${context} — ${message}`);
    }
  }
}
