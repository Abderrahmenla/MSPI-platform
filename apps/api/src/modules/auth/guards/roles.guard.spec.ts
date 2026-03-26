import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const buildContext = (user: unknown): ExecutionContext =>
  ({
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({ user }),
    }),
  }) as unknown as ExecutionContext;

const buildReflector = (roles: string[] | undefined): Reflector =>
  ({
    getAllAndOverride: jest.fn().mockReturnValue(roles),
  }) as unknown as Reflector;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RolesGuard', () => {
  it('allows request when user has the required role', () => {
    const reflector = buildReflector(['SUPER_ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = buildContext({ role: 'SUPER_ADMIN' });

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when user lacks required role', () => {
    const reflector = buildReflector(['SUPER_ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = buildContext({ role: 'VIEWER' });

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user has no role at all', () => {
    const reflector = buildReflector(['SUPER_ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = buildContext({});

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when user object is null', () => {
    const reflector = buildReflector(['SUPER_ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = buildContext(null);

    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('allows request when no roles are defined on endpoint (undefined)', () => {
    const reflector = buildReflector(undefined);
    const guard = new RolesGuard(reflector);
    const ctx = buildContext(null);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows request when roles array is empty', () => {
    const reflector = buildReflector([]);
    const guard = new RolesGuard(reflector);
    const ctx = buildContext(null);

    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('uses ROLES_KEY when calling reflector', () => {
    const reflector = buildReflector(['ADMIN']);
    const guard = new RolesGuard(reflector);
    const ctx = buildContext({ role: 'ADMIN' });

    guard.canActivate(ctx);

    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
  });
});
