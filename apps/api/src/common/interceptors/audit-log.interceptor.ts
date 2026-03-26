import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';
import { Observable, tap } from 'rxjs';

import { PrismaService } from '../../database/prisma.service';

const ADMIN_PATH_PREFIX = '/api/v1/admin/';
const SKIP_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditLogInterceptor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const { method, url } = request;

    const isAdminRoute = url.startsWith(ADMIN_PATH_PREFIX);
    const isMutation = !SKIP_METHODS.has(method.toUpperCase());

    if (!isAdminRoute || !isMutation) {
      return next.handle();
    }

    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const resource = `${controllerName}#${handlerName}`;
    const action = `${method.toUpperCase()} ${url}`;

    return next.handle().pipe(
      tap({
        next: (responseBody: unknown) => {
          void this.writeAuditLog({
            request,
            method,
            action,
            resource,
            responseBody,
          });
        },
        error: () => {
          // Do not audit failed mutations — no state change occurred.
        },
      }),
    );
  }

  private async writeAuditLog(opts: {
    request: Request;
    method: string;
    action: string;
    resource: string;
    responseBody: unknown;
  }): Promise<void> {
    const { request, method, action, resource, responseBody } = opts;

    try {
      const adminUser = (
        request as Request & { user?: { id: bigint | number | string } }
      ).user;

      if (!adminUser?.id) {
        this.logger.warn(
          `AuditLogInterceptor: no admin user on request for ${action}`,
        );
        return;
      }

      const adminId = BigInt(adminUser.id);
      const upperMethod = method.toUpperCase();

      let before: unknown = null;
      let after: unknown = null;

      if (upperMethod === 'POST') {
        after = responseBody ?? null;
      } else if (upperMethod === 'DELETE') {
        before = responseBody ?? null;
      } else {
        // PATCH / PUT: treat response as the updated ("after") state.
        // A "before" snapshot would require an extra DB read in the service
        // and surfacing it here; that is deferred to per-service opt-in.
        after = responseBody ?? null;
      }

      await this.prisma.auditLog.create({
        data: {
          adminId,
          action,
          resource,
          before: before !== null ? (before as object) : undefined,
          after: after !== null ? (after as object) : undefined,
        },
      });
    } catch (err) {
      this.logger.error(
        `AuditLogInterceptor: failed to write audit log for "${action}"`,
        err instanceof Error ? err.stack : String(err),
      );
    }
  }
}
