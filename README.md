# DuoPlan (DuoSpace)

![Stars](https://img.shields.io/github/stars/quickjoy1/duoplan?style=flat-square)&nbsp;![Forks](https://img.shields.io/github/forks/quickjoy1/duoplan?style=flat-square)&nbsp;![Issues](https://img.shields.io/github/issues/quickjoy1/duoplan?style=flat-square)&nbsp;![TypeScript](https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=flat-square&logo=typescript&logoColor=white)&nbsp;![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

A friendly shared study and planning workspace for two people: tasks, calendar, Class 12 subject tracking, goals, habits, journal, focus timer and in‑app reminders.

---

Welcome! DuoPlan (also referred to in the codebase as DuoSpace) is a compact, privacy‑focused planner built for two collaborators sharing a single workspace and password.

Table of contents
- Features
- Screenshots
- Quick start
- Development
- Contributing
- Roadmap
- License

## Features

- ✅ Shared workspace for two profiles behind one password
- 🗂 Tasks with categories, priorities, due dates and time estimates
- 📅 Calendar with monthly view and agenda
- 📚 Subject & chapter tracking for Class 12 study plans
- 🎯 Goals with progress tracking
- 🔁 Habits and daily check‑ins
- 📝 Shared journal (visible to both profiles)
- ⏱ Focus timer (saveable sessions)
- 🔔 In‑app reminders (no email/SMS/push — reminders live in the app)
- ⚡ Live sync across open devices (server‑sent events)

## Screenshot

Add a screenshot under /assets or /docs and update the path below:

![DuoPlan screenshot](https://via.placeholder.com/1000x420.png?text=DuoPlan+Screenshot)

## Quick start

1. Clone

```bash
git clone https://github.com/quickjoy1/duoplan.git
cd duoplan
```

2. Install

```bash
pnpm install
# or
npm install
# or
yarn
```

3. Run (dev)

```bash
pnpm dev
# or
npm run dev
```

4. Open http://localhost:3000 (or the configured port)

## Development

- Language: TypeScript (majority of the repo)
- Monorepo: pnpm workspaces
- Frontend: React + Vite (see artifacts/duospace)
- API: Express, PostgreSQL (Drizzle ORM)

Useful scripts (from repo root):

```bash
pnpm -w run typecheck    # typecheck every package
pnpm --filter @workspace/api-server run dev
pnpm --filter @workspace/duospace run dev
pnpm run build
```

## Environment

Copy `.env.example` and fill required values. Key env vars used:

- DATABASE_URL — Postgres connection
- SESSION_SECRET — secret for sessions
- DUOSPACE_WORKSPACE_PASSWORD — initial shared password (first run)
- PORT / BASE_PATH — server / web ports

Keep real secrets out of the repo.

## Contributing

Thanks for helping improve DuoPlan! A few quick ways to contribute:

- Report bugs and feature ideas using Issues
- Open PRs for UI polish, accessibility, and tests
- Improve docs, add screenshots and setup notes for alternative hosts

If you want a lightweight contribution guide in the repo, add a CONTRIBUTING.md (I can create one). If you'd like, I can open a PR with a suggested CONTRIBUTING.md, ISSUE templates, and a CODE_OF_CONDUCT.

## Roadmap (ideas)

- User accounts (per‑person sync)
- Mobile UI improvements and PWA support
- Recurring tasks, subtasks, and richer reminders
- Export / backup improvements and import tools

## License

This project is MIT licensed. See LICENSE for details.

---

If you'd like, I can also:
- Add a CONTRIBUTING.md and an ISSUE template
- Add an MIT LICENSE file
- Add a nice banner image or demo GIF under /assets and wire it into the README

Tell me which of these (CONTRIBUTING, LICENSE, assets) you want me to add and I'll commit them now.