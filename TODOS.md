# TODOS

## Deferred from TDD v1.0 Review (2026-03-25)

### TODO-001: Migrate image storage to S3-compatible service

- **What:** Replace local filesystem image storage with S3-compatible object storage (Cloudflare R2 or AWS S3).
- **Why:** Local filesystem doesn't survive container deployments, has no CDN, and doesn't scale. Currently acceptable for VPS deployment.
- **Trigger:** When moving from VPS to containerized deployment (Docker/K8s).
- **Effort:** M (presigned URL endpoint + migration script)
- **Priority:** P2
- **Depends on:** Deployment architecture decision

### TODO-002: WhatsApp Business API integration

- **What:** Replace manual wa.me links with automated WhatsApp Business API calls for order/quote notifications.
- **Why:** Manual notifications require admin to click + send for every status change. Automation reduces ops friction.
- **Trigger:** When daily order volume exceeds ~50/day.
- **Effort:** L (API integration + webhook handler + message queue)
- **Priority:** P2
- **Depends on:** WhatsApp Business account approval

### TODO-003: Email notification system

- **What:** Add transactional email for order confirmations, status changes, and admin alerts.
- **Why:** WhatsApp is primary channel but email is expected for receipt/record purposes. Also needed for admin alerts (low stock, new orders).
- **Effort:** M (email service + templates + queue)
- **Priority:** P2
- **Depends on:** Background job infrastructure (BullMQ)

### TODO-004: Meta Conversions API (CAPI)

- **What:** Server-side Meta event tracking alongside client-side Pixel.
- **Why:** Client-side Pixel is blocked by ad blockers. CAPI sends events from server, improving attribution accuracy.
- **Effort:** M (NestJS module + Meta CAPI integration)
- **Priority:** P3
- **Depends on:** Meta Business Manager setup

### TODO-005: CI/CD pipeline

- **What:** GitHub Actions or similar for automated testing, linting, and deployment.
- **Why:** Currently no automated pipeline. Manual deployment is error-prone and doesn't scale.
- **Effort:** M (pipeline config + staging environment)
- **Priority:** P1
- **Depends on:** Git repository initialization

### TODO-006: Admin kanban view optimization

- **What:** Optimize quote kanban drag-and-drop for smooth UX with real-time status updates.
- **Why:** Initial implementation may be basic table → kanban toggle. Drag-and-drop with optimistic updates needs careful implementation.
- **Effort:** S (frontend polish)
- **Priority:** P3
- **Depends on:** Basic quotes module

### ~~TODO-007: Reduce admin roles to 2 for MVP~~ — CLOSED

- **Decision (2026-03-26):** Keep all 4 roles (`SUPER_ADMIN`, `MANAGER`, `OPERATOR`, `VIEWER`) as specified in PRD. `RolesGuard` is generic so adding more roles later is trivial.

### TODO-009: Admin strategy LRU cache — deactivation window

- **What:** Document and eventually eliminate the 15s window during which a just-deactivated admin remains authorized.
- **Why:** `AdminJwtStrategy` caches validated admin records for 15s to reduce DB load. A deactivated admin's session isn't revoked until the cache entry expires.
- **Context:** Added during auth review (2026-03-26). `CACHE_TTL_MS = 15_000` in `admin-jwt.strategy.ts`. For immediate revocation, bypass the cache on the `active` check, or persist a revocation flag in a fast store (Redis). 15s is acceptable for a single-admin-team MVP.
- **Effort:** S (bypass cache for active check) → M (Redis revocation list)
- **Priority:** P2
- **Depends on:** Traffic volume; revisit when admin team grows beyond 5

### TODO-008: Production monitoring & alerting

- **What:** Set up Sentry for API error tracking, uptime monitoring on health endpoint, and admin email/push alerts for critical events (low stock, order spikes, API errors).
- **Why:** Structured logging exists but no one is watching the logs proactively. Silent failures in production (e.g., Facebook OAuth breaking, DB connection pool exhaustion) won't be caught until a customer reports them via WhatsApp.
- **Trigger:** Immediately post-launch. Should be the first post-launch task.
- **Effort:** M (Sentry integration + uptime cron + alert rules)
- **Priority:** P1
- **Depends on:** Production deployment (M5-T16)
- **Context:** Plan includes structured JSON logging and `/health` endpoint. Sentry SDK for NestJS is well-documented. Uptime can be a simple cron hitting `/api/v1/health`. Low-stock alerts could use the existing `threshold` field on products — just needs a scheduled check + notification channel.
