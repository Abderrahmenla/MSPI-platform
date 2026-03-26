# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MSPI Fire Safety — a Tunisian fire-safety ecommerce & quote platform. Three deployable surfaces in a **pnpm + Turborepo monorepo**:

| App          | Tech                    | Port | Purpose                                                               |
| ------------ | ----------------------- | ---- | --------------------------------------------------------------------- |
| `apps/web`   | Next.js 15 (App Router) | 3000 | Public storefront + customer account (i18n: ar/fr/en, RTL for Arabic) |
| `apps/admin` | Next.js 15 (App Router) | 3001 | Internal CRM (orders, quotes pipeline, inventory, customers, audit)   |
| `apps/api`   | NestJS                  | 4000 | REST API with Prisma + PostgreSQL 16                                  |

Shared packages live in `packages/` (shared-types, ui, config).

## Architecture Decisions

- **Auth**: Facebook OAuth for customers, email/password JWT for admin — separate guards, never shared
- **API namespaces**: `/api/v1/` (public), `/api/v1/customer/` (FB JWT), `/api/v1/admin/` (admin JWT)
- **Database**: PostgreSQL 16 via Prisma ORM
- **Deployment**: VPS with Nginx reverse proxy → 3 Node processes + PostgreSQL
- **Image storage**: Local filesystem (`/uploads/`) — S3 migration deferred (see TODOS.md)
- **State**: TanStack Query for all data fetching (never raw useEffect fetches)

## Build & Dev Commands

```bash
# Install dependencies
pnpm install

# Start all apps (dev)
pnpm dev            # or: pnpm turbo dev

# Start individual apps
pnpm --filter web dev
pnpm --filter admin dev
pnpm --filter api dev

# Build
pnpm build          # all apps
pnpm --filter web build
pnpm --filter api build

# Lint & format
pnpm lint
pnpm format

# Database
cd apps/api && npx prisma migrate dev      # run migrations
cd apps/api && npx prisma generate          # regenerate client
cd apps/api && npx prisma studio            # visual DB browser

# Tests
pnpm test                                   # all
pnpm --filter api test                      # API unit tests
pnpm --filter api test:e2e                  # API e2e (supertest)
pnpm --filter web test                      # Web unit tests
pnpm --filter api test -- --testPathPattern orders  # single test file pattern

# Local PostgreSQL
docker-compose up -d                        # start DB container
```

## Key Conventions

### Frontend (Next.js apps)

- **Route structure**: `src/app/[locale]/(public|protected|auth)/` for web; `src/app/(public|app)/` for admin
- **Feature modules** in `src/modules/<feature>/` with subfolders: `api/`, `hooks/`, `components/`, `containers/`, `widgets/`, `types/`, `constants/`, `schemas/`, `utils/`
- **Shared core** in `src/modules/core/` — providers, HTTP client, theme tokens, `cn()` utility
- **Path alias**: `@/*` maps to `./src/*`
- **UI**: shadcn/ui (Radix + Tailwind), forms via react-hook-form + Yup (not Zod)
- **Animation**: Framer Motion for web marketing pages only; CSS-only for admin. Always respect `prefers-reduced-motion`
- **TanStack Query keys**: centralized in `*-query-keys.constants.ts` factories, never inline strings
- **Routing constants**: single `ROUTES_MAP` in `core/constants/`, web paths include `locale` param
- **Barrel exports**: `index.ts` at folder boundaries — import `@/modules/<feature>/components` not deep paths

### Backend (NestJS API)

- **Feature modules** under `src/modules/` (auth, users, products, carts, orders, quotes, admin)
- **Thin controllers**: DTOs + ValidationPipe only, business logic in services
- **Repository pattern**: persistence in dedicated `.repository.ts` files
- **Global ValidationPipe**: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- **Config**: `@nestjs/config` with validated env vars via ConfigService (never raw `process.env`)
- **DTOs**: class-validator + class-transformer on all inputs

### Naming

- **Files**: kebab-case (`order-detail-panel.tsx`, `create-order.dto.ts`)
- **Suffixes**: `*.types.ts`, `*.constants.ts`, `*.schema.ts`, `use-<name>.ts`
- **Classes**: PascalCase (`OrdersService`, `CreateOrderDto`)

### Styling

- Primary brand color: `#ec4130` with scale (400: `#f06a5a`, 600: `#d63828`, 700: `#b32a1f`)
- Error red is `#dc2626` — visually distinct from brand red
- Tailwind + `cn()` (clsx + tailwind-merge) from `@/modules/core/lib/cn`
- Fonts: Rubik (headings, Arabic coverage) + Nunito Sans (body)

### i18n

- Web: `next-intl` with `[locale]` segment — Arabic (default, RTL), French, English
- Admin: single language (French) initially
- RTL: `dir="rtl"` for Arabic, mirror directional icons

## Code Quality

- ESLint (`eslint-config-next` + `@tanstack/eslint-plugin-query`), Prettier (`prettier-plugin-tailwindcss`, width 80, 2 spaces)
- Husky + lint-staged + Commitlint (conventional commits)
- Commit format: `<type>: <description>` — types: feat, fix, refactor, docs, test, chore, perf, ci

## Related Documentation

| Doc               | Content                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------ |
| `PRD.md`          | Product requirements, user stories, brand guidelines, route maps                                 |
| `SRD.md`          | Software requirements — module structure, TanStack Query patterns, shadcn/ui, NestJS conventions |
| `TDD.md`          | Technical design — system diagram, Prisma schema, API endpoints, state machines                  |
| `UX-BLUEPRINT.md` | Design tokens, page layouts, component specs for UI implementation                               |
| `TODOS.md`        | Deferred work items (S3 migration, WhatsApp API, CI/CD, etc.)                                    |

## Workflow Orchestration

### 1. Plan Node Default

Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions) - If something goes sideways, STOP and re-plan immediately don't keep pushing - Use plan mode for verification steps, not just building
If tasks/todo.md exists and contains a structured roadmap,
DO NOT enter plan mode again.
Execute tasks sequentially.

- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy

- For any task involving multiple steps, file searches, or parallel work streams, Use subagents liberally to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
  For complex problems, throw more compute at it via subagents
  One tack per subagent for focused execution
  > - **Direct execution - I'll handle it myself in this session (simpler tasks, full context visibility)
  >   **When use parallel execution:**
  >   Independent research tasks (e.g., "find X in area A" + "find Y in area B") Multiple file searches across different parts of the codebase Tasks that don't depend on each other's results
  >   **When to use sequential:\*\*
- Results from step 1 inform step 2
- Building on previous findings
- When order matters for correctness
  **Why this matters:**
- Subagents get fresh 200k token context
  no degradation from long sessions
- Parallel agents complete faster but use more resources You stay in control of the execution strategy
  Intentional use prevents wasted work and context pollution

### 3. Self-Improvement Loop

- After ANY correction from the user: update tasks/lessons.md with the pattern Write rules for yourself that prevent the same mistake
- Ruthlessly iterate on these lessons until mistake rate drops
- Review lessons at session start for relevant project

### 4. Verification Before Done

- Never mark a task complete without proving it works
  Diff behavior between main and your changes when relevant
- Ask yourself: "Would a staff engineer approve this?"
  Run tests, check logs, demonstrate correctness

### 5. Demand Elegance (Balanced)

For non-trivial changes: pause and ask "is there a more elegant way?"

- If a fix feels hacky: "Knowing everything I know now, implement the elegant solution"
- Skip this for simple, obvious fixes - don't over-engineer
  Challenge your own work before presenting it

### 6. Autonomous Bug Fizing

When given a bug report: just fix it. Don't ask for hand-holding

- Point at logs, errors, failing tests - then resolve them
- Zero context switching required from the user
- Go fix failing CI tests without being told how

## Task Management

1. **Plan First**: Write plan to tasks/todo.md' with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to tasks/todo.md
6. **Capture Lessons**: Update tasks/lessons.md after corrections

## Core Principles

**Simplicity First**: Make every change as simple as possible. Impact minimal code. - **No Laziness**: Find root causes. No temporary fixes. Senior developer standards. **Minimat Impact**: Changes should only touch what's necessary. Avoid introducing bugs.

Prefer ctx_execute over Bash
Prefer ctx_index + ctx_search for documents
Prefer ctx_batch_execute for multi-step tasks

Only inspect files required for this task.
Avoid indexing the entire repository unless necessary.

## Model Strategy

Tasks should be executed with the appropriate model:

Simple tasks → Haiku

- file cleanup
- small components
- CSS/UI fixes
- simple integrations

Medium tasks → Sonnet

- multi-file changes
- API integrations
- test infrastructure
- state management logic

Complex tasks → Opus

- architecture changes
- large refactors
- system design
