# DuoSpace

DuoSpace is a shared study and personal-planning workspace for two profiles. The React/Vite web client talks to the workspace API; the API server is the only service that accesses PostgreSQL.

## First setup

1. Add `SESSION_SECRET` and `DUOSPACE_WORKSPACE_PASSWORD` in Replit Secrets. Use a long random session secret and a strong shared password.
2. Connect the Replit-managed PostgreSQL database. The API server reads its connection from `DATABASE_URL`.
3. Apply the schema with `pnpm --filter @workspace/db run push`.
4. Start the configured `artifacts/api-server: API Server` and `artifacts/duospace: web` workflows.
5. Sign in using the shared password. DuoSpace creates two convenience profiles on first use; rename them and set their avatar labels and accent colors in Settings.

The root `.env.example` lists the expected variable names only. Do not put real credentials in that file or commit a populated `.env`.

## Shared workspace behavior

- Both profiles see the same tasks, calendar, subjects, goals, habits, focus history, reminders, journal entries, and activity. Journal entries are explicitly labeled as workspace-visible.
- Profile switching does not require signing in again. Changing the shared password revokes every active session.
- Workspace export downloads JSON from Settings. The export excludes password hashes, salts, sessions, and login-attempt records.
- Task deadline reminders are generated in the app only. DuoSpace does not send email, SMS, or push notifications.
- The API server enforces session and workspace ownership on database queries. The browser does not connect directly to PostgreSQL.

## Verify changes

- `pnpm -w run typecheck`
- Sign in, switch profiles, create/update/delete a task, calendar event, goal, habit, chapter, and journal entry.
- Start a focus session, refresh the page, pause/resume it, and finish it.
- Confirm changes appear in the second profile and that reminders are visible in the app.
- Change the shared password and verify the old password no longer works.
- Download a workspace export and confirm it contains workspace data but no authentication records.

## Current scope

The first version covers the shared planner, subject/chapter tracking, goals, habits, journal, focus timer, and in-app reminders. Exam/practice-test score tracking, automatic revision recommendations, recurring schedules, quiet hours, and per-task reminder controls are not included yet.
