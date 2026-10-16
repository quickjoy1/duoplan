# DuoSpace

A shared study and personal-planning workspace for two people. DuoSpace brings tasks, a calendar, Class 12 subject and chapter tracking, goals, habits, a journal, a focus timer and in-app reminders into one calm, dark-themed web app.

Two profiles share one workspace behind a single password. Both profiles see and edit the same data, and changes made on one device show up on the other without a refresh.

> **Status:** first working version. The core planner is built and connected to a real database. Several larger features from the original plan are not built yet; see [What's not built yet](#whats-not-built-yet).

## Features

- **Shared workspace login.** One shared password, then a "Who's here?" profile picker. Switch profiles any time without signing in again.
- **Tasks.** Create, edit status, search, filter by status and delete. Each task has a category, priority, due date and estimated minutes.
- **Calendar.** Monthly view with an agenda list. Add, rename and delete events.
- **Academics.** Subjects and chapters with per-subject progress. Mark chapters Learning or Revised.
- **Goals.** Shared goals with a target date and a progress slider.
- **Habits.** Routines with target weekdays and a daily check-in. No streaks, so missed days aren't punished.
- **Journal.** Dated entries with an optional mood. Entries are visible to both profiles, and the app says so.
- **Focus timer.** Start, pause, resume and finish a session. Sessions are saved to the database, so a page refresh doesn't lose a running timer.
- **In-app reminders.** Deadline reminders appear in a notification centre with an unread badge. Nothing is sent by email, SMS or push.
- **Live sync.** Changes are pushed to every open device over server-sent events.
- **Settings.** Workspace name, time zone, theme (dark, light or system), default task length, focus and break lengths, profile names, avatars and accent colours, password change, sign out of all devices, and a JSON export of workspace data.
- **Dashboard.** Greeting, tasks due today, open and completed counts, focus time this week, goals in progress, recent activity and a workload indicator.

### How reminders work

The API server checks open tasks with a deadline every 60 seconds and creates notifications in the database, so a reminder is waiting even if nobody had the app open when it became due. Each task gets up to four reminders:

| Reminder | When |
| --- | --- |
| Due tomorrow | Within 24 hours of the deadline |
| Due in a few hours | Within 2 hours of the deadline |
| Due now | At the deadline, if the task is still open |
| Task overdue | After the deadline passes |

Completed and cancelled tasks are skipped. Each reminder has a unique key built from the task, its deadline and the reminder type, so repeated runs never create duplicates. If a task's deadline changes, it gets fresh reminders for the new deadline. These timings are fixed in code and can't be changed in Settings yet.

## What's not built yet

These were part of the original plan but aren't in the app today:

- Exams, practice-result tracking and automatic revision suggestions
- Analytics charts, weekly review and the smart daily planner
- Recurring tasks and events, subtasks and checklists, board view, and week and day calendar views
- Quiet hours, per-task reminder controls, snooze and notification-history filters
- Task reassignment between profiles, task-to-goal links and goal milestones
- PWA support (there is no web app manifest or service worker yet)
- Pomodoro break cycles. Break lengths are saved in Settings, but the timer currently runs focus sessions only.

## Tech stack

| Layer | Technology |
| --- | --- |
| Monorepo | pnpm workspaces, TypeScript 5.9, Node.js 24 |
| Frontend | React 19, Vite 7, Tailwind CSS 4, TanStack Query, wouter, Lucide icons |
| API | Express 5, Pino logging |
| Database | PostgreSQL with Drizzle ORM |
| Validation | Zod |
| API contract | OpenAPI spec with Orval-generated React Query hooks and Zod schemas |
| Hosting | Built for Replit (autoscale deployment, managed PostgreSQL) |

## Project structure

```
artifacts/
  duospace/        React web app (Vite)
  api-server/      Express API: auth, routes, reminders, live events
  mockup-sandbox/  Replit design sandbox, not part of the product
lib/
  api-spec/        openapi.yaml, the source of truth for the API, plus Orval config
  api-client-react/ Generated React Query hooks and the fetch wrapper
  api-zod/         Generated Zod schemas and types
  db/              Drizzle schema (src/schema/duospace.ts) and drizzle-kit config
scripts/           Workspace helper scripts and the post-merge hook
```

The database schema lives in `lib/db/src/schema/duospace.ts`. The API contract lives in `lib/api-spec/openapi.yaml`.

## Getting started on Replit

1. In Replit Secrets, add `SESSION_SECRET` (a long random string) and `DUOSPACE_WORKSPACE_PASSWORD` (a strong shared password).
2. Provision the Replit PostgreSQL database so `DATABASE_URL` is set.
3. Create the tables: `pnpm --filter @workspace/db run push`
4. Start the `API Server` and `web` workflows.
5. Open the app and sign in with the shared password. Two profiles are created on first use. Rename them and set their avatars and colours in Settings.

## Environment variables

Copy `.env.example` for reference. It contains names only. Never commit real values.

| Variable | Required | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `SESSION_SECRET` | Yes | Secret used to derive password hashes and sign sessions |
| `DUOSPACE_WORKSPACE_PASSWORD` | Yes, first run | Initial shared password. It is stored as a salted hash, and changing the password in Settings replaces it. |
| `PORT` | Yes | Port the API server or Vite server listens on (set per service by Replit) |
| `BASE_PATH` | Yes, web app | URL base path for the web app, `/` by default |

## Scripts

Run these from the repository root.

| Command | What it does |
| --- | --- |
| `pnpm install` | Install dependencies (pnpm is required; npm and yarn are blocked) |
| `pnpm --filter @workspace/api-server run dev` | Build and start the API server |
| `pnpm --filter @workspace/duospace run dev` | Start the web app dev server |
| `pnpm run typecheck` | Typecheck every package |
| `pnpm run build` | Typecheck and build everything |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from `openapi.yaml` |
| `pnpm --filter @workspace/db run push` | Push schema changes to the database (development only) |

## Running outside Replit

The project is configured for Replit, where a router sends `/api` requests to the API server and everything else to the web app. The web app calls the API with relative `/api/...` URLs and the Vite dev server has no proxy configured, so elsewhere you need to provide your own routing:

1. Set `DATABASE_URL`, `SESSION_SECRET`, `DUOSPACE_WORKSPACE_PASSWORD` and `PORT` for the API server.
2. Set `PORT` and `BASE_PATH` for the web app.
3. Put a reverse proxy (or a Vite proxy rule) in front so `/api` reaches the API server and `/` reaches the web app.

This path hasn't been tested end to end, so treat it as a starting point.

## Security notes

- The workspace password is hashed with scrypt and compared in constant time on the server. It is never validated in the browser.
- Sessions are server-side records with a 7-day lifetime, delivered in an `httpOnly`, `SameSite=Lax` cookie (and `Secure` in production). Changing the password, or choosing "Sign out all devices", revokes every session.
- Failed logins are rate limited: after 6 failures within 15 minutes, the client is blocked for 15 minutes. Attempts are tracked by a hash of the IP address.
- The browser never talks to the database. The API server checks the session and scopes every query to the workspace.
- Request logging records the method, path without query string, and status code. It does not log passwords, session tokens or journal contents.
- Both profiles have full access to all workspace data. Profile selection is a convenience, not a privacy boundary. **Do not put anything in the journal that one of you wouldn't want the other to read.**
- The JSON export leaves out password hashes, salts, sessions and login-attempt records.

## Contributing and license

This is a personal project. The workspace is MIT licensed according to `package.json`; add a `LICENSE` file if you plan to share the code.
