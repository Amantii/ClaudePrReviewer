# PR Reviewer — Claude Code Guide

This file tells Claude Code how this project works. Read it at the start of every session.

## Project Overview

AI-powered GitHub PR reviewer. When a PR is opened on a connected repo, a webhook fires, we fetch the diff, call Claude to generate a structured review, and post it as a PR comment.

## Monorepo Structure

```
pr-reviewer/
├── apps/
│   ├── api/          # Express webhook server + Claude integration (Node/TS)
│   └── web/          # Next.js dashboard for managing repo configs (React/TS)
├── packages/
│   └── shared/       # Shared TypeScript types — used by both apps
├── .github/
│   └── workflows/    # CI: lint → test → build → deploy to Railway
└── Dockerfile        # Builds the api app only
```

## Key Commands

```bash
npm run dev          # Start all apps in parallel (Turborepo)
npm run build        # Build all apps
npm run test         # Run tests across all workspaces
npm run lint         # ESLint across all workspaces
```

To run a single app:
```bash
npm run dev --workspace=apps/api
npm run dev --workspace=apps/web
```

## Environment Variables

Create `.env` files (never commit them):

**apps/api/.env**
```
ANTHROPIC_API_KEY=...
GITHUB_APP_ID=...
GITHUB_PRIVATE_KEY=...        # PEM string, newlines as \n
GITHUB_WEBHOOK_SECRET=...
DATABASE_URL=...              # Postgres connection string
```

**apps/web/.env.local**
```
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
DATABASE_URL=...
```

## Architecture Notes

- **Webhook flow**: GitHub → `apps/api/src/webhooks/github.ts` → verify sig → fetch diff → `services/claude.ts` → `services/github.ts` (post comment)
- **Auth**: The web app uses NextAuth with GitHub OAuth. The API uses GitHub App private key auth for posting comments.
- **Database**: Postgres (via Prisma) stores `RepoConfig` per installation. Schema in `apps/api/prisma/schema.prisma`.
- **Types**: Always import shared types from `@pr-reviewer/shared`, not locally redefined.

## Coding Conventions

- TypeScript strict mode on everywhere
- No `any` types — use `unknown` and narrow
- All async functions wrapped in try/catch at the boundary (webhooks, route handlers)
- Services are pure functions — no side effects outside their own domain
- Test files colocated: `foo.ts` → `foo.test.ts`

## What NOT to touch

- `packages/shared/src/index.ts` — changing types here affects both apps, always check both sides
- `.github/workflows/ci.yml` — don't add secrets as plaintext, use GitHub Secrets
- The signature verification logic in `webhooks/github.ts` — security critical
