import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of, throwError } from 'rxjs';

import { AuditLogInterceptor } from './audit-log.interceptor';
import { PrismaService } from '../../database/prisma.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildPrismaMock = () => ({
  auditLog: { create: jest.fn().mockResolvedValue({}) },
});

const buildContext = (
  method: string,
  url: string,
  user?: { id: bigint | number | string },
) =>
  ({
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ method, url, user }),
    }),
    getClass: jest.fn().mockReturnValue({ name: 'OrdersController' }),
    getHandler: jest.fn().mockReturnValue({ name: 'create' }),
  }) as unknown as ExecutionContext;

const buildHandler = (value: unknown) => ({
  handle: jest.fn().mockReturnValue(of(value)),
});

const buildErrorHandler = (error: unknown) => ({
  handle: jest.fn().mockReturnValue(throwError(() => error)),
});

// Flush void promises (fire-and-forget writeAuditLog)
const flushMicrotasks = () => Promise.resolve();

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('AuditLogInterceptor', () => {
  let interceptor: AuditLogInterceptor;
  let prisma: ReturnType<typeof buildPrismaMock>;

  beforeEach(() => {
    prisma = buildPrismaMock();
    interceptor = new AuditLogInterceptor(
      prisma as unknown as PrismaService,
      {} as Reflector,
    );
  });

  // -------------------------------------------------------------------------
  // Pass-through cases (no audit log written)
  // -------------------------------------------------------------------------

  describe('pass-through (no audit log)', () => {
    it('passes through non-admin routes without writing audit log', async () => {
      const ctx = buildContext('POST', '/api/v1/products', { id: BigInt(1) });
      const handler = buildHandler({ id: 1 });

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('passes through GET requests on admin routes without audit log', async () => {
      const ctx = buildContext('GET', '/api/v1/admin/orders', {
        id: BigInt(1),
      });
      const handler = buildHandler([{ id: 1 }]);

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('passes through HEAD requests on admin routes', async () => {
      const ctx = buildContext('HEAD', '/api/v1/admin/orders', {
        id: BigInt(1),
      });
      const handler = buildHandler(null);

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('passes through OPTIONS requests on admin routes', async () => {
      const ctx = buildContext('OPTIONS', '/api/v1/admin/products', {
        id: BigInt(1),
      });
      const handler = buildHandler(null);

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });
  });

  // -------------------------------------------------------------------------
  // Audit log written
  // -------------------------------------------------------------------------

  describe('POST on admin route', () => {
    it('writes audit log with after=responseBody and before=undefined', async () => {
      const ctx = buildContext('POST', '/api/v1/admin/orders', {
        id: BigInt(42),
      });
      const responseBody = { id: 99 };
      const handler = buildHandler(responseBody);

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: BigInt(42),
          action: 'POST /api/v1/admin/orders',
          resource: 'OrdersController#create',
          after: responseBody,
          before: undefined,
        }),
      });
    });
  });

  describe('DELETE on admin route', () => {
    it('writes audit log with before=responseBody and after=undefined', async () => {
      const ctx = buildContext('DELETE', '/api/v1/admin/orders/1', {
        id: BigInt(42),
      });
      const responseBody = { id: 1 };
      const handler = buildHandler(responseBody);

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          adminId: BigInt(42),
          action: 'DELETE /api/v1/admin/orders/1',
          before: responseBody,
          after: undefined,
        }),
      });
    });
  });

  describe('PATCH on admin route', () => {
    it('writes audit log with after=responseBody (updated state)', async () => {
      const ctx = buildContext('PATCH', '/api/v1/admin/orders/1', {
        id: BigInt(42),
      });
      const responseBody = { id: 1, status: 'CONFIRMED' };
      const handler = buildHandler(responseBody);

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'PATCH /api/v1/admin/orders/1',
          after: responseBody,
          before: undefined,
        }),
      });
    });
  });

  describe('PUT on admin route', () => {
    it('writes audit log with after=responseBody', async () => {
      const ctx = buildContext('PUT', '/api/v1/admin/products/5', {
        id: BigInt(1),
      });
      const handler = buildHandler({ id: 5, name: 'Updated' });

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          action: 'PUT /api/v1/admin/products/5',
          after: { id: 5, name: 'Updated' },
        }),
      });
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------

  describe('edge cases', () => {
    it('does not write audit log when request has no user', async () => {
      const ctx = buildContext('POST', '/api/v1/admin/orders', undefined);
      const handler = buildHandler({ id: 1 });

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('does not write audit log when user has no id', async () => {
      const ctx = buildContext(
        'POST',
        '/api/v1/admin/orders',
        {} as { id: never },
      );
      const handler = buildHandler({ id: 1 });

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('does not write audit log on failed mutations (error path)', async () => {
      const ctx = buildContext('POST', '/api/v1/admin/orders', {
        id: BigInt(1),
      });
      const handler = buildErrorHandler(new Error('Service error'));

      try {
        await lastValueFrom(interceptor.intercept(ctx, handler));
      } catch {
        // expected to throw
      }
      await flushMicrotasks();

      expect(prisma.auditLog.create).not.toHaveBeenCalled();
    });

    it('swallows prisma failure without rethrowing', async () => {
      prisma.auditLog.create.mockRejectedValue(new Error('DB down'));
      const ctx = buildContext('POST', '/api/v1/admin/orders', {
        id: BigInt(1),
      });
      const handler = buildHandler({ id: 1 });

      // Should not throw despite DB failure
      await expect(
        lastValueFrom(interceptor.intercept(ctx, handler)).then(
          flushMicrotasks,
        ),
      ).resolves.not.toThrow();
    });

    it('converts numeric user id to BigInt for adminId', async () => {
      const ctx = buildContext('POST', '/api/v1/admin/orders', { id: 7 });
      const handler = buildHandler({ id: 1 });

      await lastValueFrom(interceptor.intercept(ctx, handler));
      await flushMicrotasks();

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ adminId: BigInt(7) }),
      });
    });
  });
});
