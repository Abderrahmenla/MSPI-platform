import {
  ArgumentsHost,
  HttpException,
  HttpStatus,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

import { GlobalExceptionFilter } from './global-exception.filter';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildHostMock = (method = 'GET', url = '/test/path') => {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const response = { status };
  const request = { method, url };

  const host = {
    switchToHttp: jest.fn().mockReturnValue({
      getResponse: jest.fn().mockReturnValue(response),
      getRequest: jest.fn().mockReturnValue(request),
    }),
  } as unknown as ArgumentsHost;

  return { host, status, json };
};

const makePrismaError = (code: string) =>
  new PrismaClientKnownRequestError('prisma error', {
    code,
    clientVersion: '5.0.0',
  });

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
  });

  // -------------------------------------------------------------------------
  // HttpException handling
  // -------------------------------------------------------------------------

  describe('HttpException', () => {
    it('maps 401 UnauthorizedException to correct envelope', () => {
      const { host, status, json } = buildHostMock();

      filter.catch(new UnauthorizedException('Invalid credentials'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.UNAUTHORIZED,
          message: 'Invalid credentials',
        }),
      );
    });

    it('maps 404 NotFoundException correctly', () => {
      const { host, status, json } = buildHostMock();

      filter.catch(new NotFoundException('Product not found'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Product not found',
        }),
      );
    });

    it('handles HttpException with object response body', () => {
      const { host, status, json } = buildHostMock();
      const exception = new HttpException(
        { message: 'Validation failed', error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
        }),
      );
    });

    it('falls back to exception.message when response has no message field', () => {
      const { host, json } = buildHostMock();
      const exception = new HttpException(
        'Plain string message',
        HttpStatus.FORBIDDEN,
      );

      filter.catch(exception, host);

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Plain string message' }),
      );
    });
  });

  // -------------------------------------------------------------------------
  // Prisma error handling
  // -------------------------------------------------------------------------

  describe('PrismaClientKnownRequestError', () => {
    it('maps P2025 (record not found) to 404', () => {
      const { host, status, json } = buildHostMock();

      filter.catch(makePrismaError('P2025'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Record not found',
        }),
      );
    });

    it('maps P2002 (unique constraint) to 409', () => {
      const { host, status, json } = buildHostMock();

      filter.catch(makePrismaError('P2002'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.CONFLICT,
          message: 'Unique constraint violation',
        }),
      );
    });

    it('maps P2003 (foreign key constraint) to 400', () => {
      const { host, status, json } = buildHostMock();

      filter.catch(makePrismaError('P2003'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Foreign key constraint violation',
        }),
      );
    });

    it('falls through to 500 for unmapped Prisma error codes', () => {
      const { host, status } = buildHostMock();

      filter.catch(makePrismaError('P9999'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  // -------------------------------------------------------------------------
  // Unknown errors
  // -------------------------------------------------------------------------

  describe('unknown errors', () => {
    it('maps plain Error to 500 Internal Server Error', () => {
      const { host, status, json } = buildHostMock();

      filter.catch(new Error('Something exploded'), host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
          error: 'Internal Server Error',
        }),
      );
    });

    it('maps non-Error thrown values to 500', () => {
      const { host, status } = buildHostMock();

      filter.catch('unexpected string throw', host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('maps null thrown value to 500', () => {
      const { host, status } = buildHostMock();

      filter.catch(null, host);

      expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  // -------------------------------------------------------------------------
  // Response envelope shape
  // -------------------------------------------------------------------------

  describe('response envelope', () => {
    it('always includes statusCode, message, and error fields', () => {
      const { host, json } = buildHostMock();

      filter.catch(new UnauthorizedException('Denied'), host);

      expect(json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: expect.any(Number),
          message: expect.any(String),
          error: expect.any(String),
        }),
      );
    });
  });
});
