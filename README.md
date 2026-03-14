# 🔍 PR Reviewer

> An AI-powered GitHub App that automatically reviews pull requests using Claude — posting structured code analysis as PR comments the moment a PR is opened.

![CI](https://github.com/YOUR_USERNAME/pr-reviewer/actions/workflows/ci.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## What it does

Install the GitHub App on any repo. Every time a PR is opened or updated, PR Reviewer:

1. **Fetches the diff** from the GitHub API
2. **Sends it to Claude** with your repo's custom review instructions
3. **Posts a structured review comment** with a quality score, issue severity levels, and line-specific feedback

<img src="docs/screenshot.png" alt="Example PR review comment" width="700" />

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Monorepo** | [Turborepo](https://turbo.build) + npm workspaces |
| **API** | Node.js, Express, TypeScript |
| **Web Dashboard** | Next.js 14 (App Router), Tailwind CSS |
| **AI** | [Anthropic Claude API](https://docs.anthropic.com) (`claude-sonnet-4-6`) |
| **GitHub Integration** | GitHub App (Webhooks + REST API) |
| **Database** | PostgreSQL via Prisma ORM |
| **Auth** | NextAuth.js with GitHub OAuth |
| **Containerization** | Docker (multi-stage build) |
| **CI/CD** | GitHub Actions → Railway |

---

## Architecture

```
GitHub Webhook (PR opened)
        │
        ▼
  ┌─────────────┐     verify HMAC      ┌──────────────────┐
  │  Express API │ ──────────────────▶ │  Webhook Handler  │
  └─────────────┘                      └────────┬─────────┘
                                                │
                              ┌─────────────────▼──────────────────┐
                              │  1. Fetch diff (GitHub REST API)    │
                              │  2. Load repo config (Postgres)     │
                              │  3. Call Claude API → JSON review   │
                              │  4. Post comment (GitHub REST API)  │
                              └────────────────────────────────────┘

  ┌──────────────────┐
  │  Next.js Dashboard│  ← repo owners configure ignore paths,
  └──────────────────┘    custom instructions, enable/disable
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- A GitHub account (to create a GitHub App)
- An [Anthropic API key](https://console.anthropic.com)
- PostgreSQL database

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/pr-reviewer
cd pr-reviewer
npm install
```

### 2. Create a GitHub App

1. Go to **GitHub → Settings → Developer Settings → GitHub Apps → New GitHub App**
2. Set the webhook URL to your deployed API: `https://your-api.railway.app/webhook`
3. Grant **Pull requests: Read & Write** permissions
4. Subscribe to **Pull request** events
5. Download the private key and note your App ID

### 3. Set up environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Fill in your keys (see `.env.example` files for all required vars).

### 4. Run locally

```bash
# Start both apps
npm run dev

# API runs on http://localhost:3001
# Web runs on http://localhost:3000

# For local webhook testing, use a tunnel:
npx cloudflared tunnel --url http://localhost:3001
```

### 5. Deploy

Push to `main` — GitHub Actions will lint, test, build a Docker image, push to GitHub Container Registry, and deploy to Railway automatically.

---

## Configuration

Each connected repo can be configured via the dashboard:

| Setting | Description |
|---|---|
| `enabled` | Toggle reviews on/off for this repo |
| `ignorePaths` | Glob patterns to skip (e.g. `*.lock`, `dist/**`) |
| `customInstructions` | Extra context for Claude (e.g. "This is a React codebase using Redux") |
| `minSeverity` | Minimum severity level to include in comments |

---

## Example Review Output

```
## 🔍 PR Review — Score: 74/100

This PR adds user authentication via JWT. The overall structure is solid,
but there are security concerns in the token validation logic that should
be addressed before merging.

### 🚨 Critical
- **`src/auth/validate.ts:23`** — JWT secret is read from `process.env` on every request.
  Cache it at startup to prevent env mutation attacks and improve performance.

### ⚠️ Warning
- **`src/routes/user.ts:45`** — Missing rate limiting on the login endpoint.
  This is vulnerable to brute-force attacks.

### 💡 Suggestion
- **`src/auth/types.ts`** — Consider using a branded type for `UserId` to prevent
  accidental type confusion with other string IDs.

### ✅ Praise
- Clean separation of concerns between the auth middleware and route handlers.
```

---

## Project Structure

```
pr-reviewer/
├── apps/
│   ├── api/                    # Webhook server + Claude integration
│   │   └── src/
│   │       ├── webhooks/       # GitHub event handlers
│   │       ├── services/       # Claude, GitHub API, config
│   │       └── routes/         # REST endpoints for the dashboard
│   └── web/                    # Next.js config dashboard
│       └── src/
│           ├── app/            # App Router pages
│           ├── components/     # UI components
│           └── lib/            # Auth, DB client, utilities
├── packages/
│   └── shared/                 # Shared TypeScript types
├── .github/workflows/          # CI/CD pipeline
├── Dockerfile
└── CLAUDE.md                   # Claude Code context file
```

---

## Contributing

PRs welcome! This repo uses itself for code review — so your PR will be automatically reviewed by the bot before a human looks at it.

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes
4. Open a PR — the bot will review it within ~30 seconds

---

## License

MIT © [Your Name](https://github.com/YOUR_USERNAME)
