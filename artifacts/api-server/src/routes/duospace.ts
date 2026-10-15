import { EventEmitter } from "node:events";
import { and, asc, desc, eq, gte, ilike, inArray, isNull, lte, lt, sql } from "drizzle-orm";
import { Router, type IRouter, type Request, type Response } from "express";
import {
  activityEventsTable,
  calendarEventsTable,
  chaptersTable,
  db,
  focusSessionsTable,
  goalsTable,
  habitLogsTable,
  habitsTable,
  journalEntriesTable,
  notificationsTable,
  profilesTable,
  subjectsTable,
  tasksTable,
  workspacesTable,
  workspaceSessionsTable,
} from "@workspace/db";
import {
  ChangeWorkspacePasswordBody,
  ChangeWorkspacePasswordResponse,
  CreateCalendarEventBody,
  CreateCalendarEventResponse,
  CreateChapterBody,
  CreateChapterResponse,
  CreateFocusSessionBody,
  CreateFocusSessionResponse,
  CreateGoalBody,
  CreateGoalResponse,
  CreateHabitBody,
  CreateHabitCheckInBody,
  CreateHabitCheckInParams,
  CreateHabitCheckInResponse,
  CreateHabitResponse,
  CreateJournalEntryBody,
  CreateJournalEntryResponse,
  CreateSubjectBody,
  CreateSubjectResponse,
  CreateTaskBody,
  CreateTaskResponse,
  DeleteCalendarEventParams,
  DeleteChapterParams,
  DeleteGoalParams,
  DeleteHabitParams,
  DeleteJournalEntryParams,
  DeleteSubjectParams,
  DeleteTaskParams,
  GetAuthSessionResponse,
  GetDashboardQueryParams,
  GetDashboardResponse,
  GetWorkspaceSettingsResponse,
  ExportWorkspaceDataResponse,
  ListActivityResponse,
  ListCalendarEventsQueryParams,
  ListCalendarEventsResponse,
  ListChaptersQueryParams,
  ListChaptersResponse,
  ListFocusSessionsQueryParams,
  ListFocusSessionsResponse,
  ListGoalsResponse,
  ListHabitsResponse,
  ListJournalEntriesResponse,
  ListNotificationsQueryParams,
  ListNotificationsResponse,
  ListSubjectsResponse,
  ListTasksQueryParams,
  ListTasksResponse,
  LoginToWorkspaceBody,
  LoginToWorkspaceResponse,
  MarkNotificationReadParams,
  MarkNotificationReadResponse,
  SelectProfileBody,
  SelectProfileResponse,
  RevokeWorkspaceSessionsResponse,
  UpdateCalendarEventBody,
  UpdateCalendarEventParams,
  UpdateCalendarEventResponse,
  UpdateChapterBody,
  UpdateChapterParams,
  UpdateChapterResponse,
  UpdateFocusSessionBody,
  UpdateFocusSessionParams,
  UpdateFocusSessionResponse,
  UpdateGoalBody,
  UpdateGoalParams,
  UpdateGoalResponse,
  UpdateHabitBody,
  UpdateHabitParams,
  UpdateHabitResponse,
  UpdateJournalEntryBody,
  UpdateJournalEntryParams,
  UpdateJournalEntryResponse,
  UpdateSubjectBody,
  UpdateSubjectParams,
  UpdateSubjectResponse,
  UpdateTaskBody,
  UpdateTaskParams,
  UpdateTaskResponse,
  UpdateWorkspaceSettingsBody,
  UpdateWorkspaceSettingsResponse,
} from "@workspace/api-zod";
import {
  createWorkspaceSession,
  currentWorkspaceContext,
  ensureWorkspace,
  getWorkspaceContext,
  listWorkspaceProfiles,
  requireWorkspace,
  revokeCurrentSession,
  updateWorkspacePassword,
  validateWorkspacePassword,
} from "../lib/duospace-auth";

const router: IRouter = Router();
const liveEvents = new EventEmitter();
const DEFAULT_SUBJECTS = [
  ["Physics", "#9b8cff"],
  ["Chemistry", "#53c7eb"],
  ["Mathematics", "#faad62"],
  ["Computer Science", "#79d7a1"],
  ["English Core", "#ff8c9f"],
  ["Artificial Intelligence", "#68a7ff"],
] as const;

function iso(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function dateOnly(value: Date | string | null | undefined): string | null {
  if (value == null) return null;
  return value instanceof Date ? value.toISOString().slice(0, 10) : value.slice(0, 10);
}

function dateInZone(value: Date, timezone: string): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

function taskDto(row: typeof tasksTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    subjectId: row.subjectId,
    dueAt: iso(row.dueAt),
    priority: row.priority,
    status: row.status,
    estimatedMinutes: row.estimatedMinutes,
    actualMinutes: row.actualMinutes,
    assignedProfileId: row.assignedProfileId,
    notes: row.notes,
    tags: row.tags,
    createdByProfileId: row.createdByProfileId,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function calendarDto(row: typeof calendarEventsTable.$inferSelect) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    startAt: row.startAt.toISOString(),
    endAt: row.endAt.toISOString(),
    allDay: row.allDay,
    subjectId: row.subjectId,
    profileId: row.profileId,
    createdAt: row.createdAt.toISOString(),
  };
}

async function addActivity(
  workspaceId: string,
  profileId: string | null,
  action: string,
  description: string,
): Promise<void> {
  await db.insert(activityEventsTable).values({ workspaceId, profileId, action, description });
}

async function assertProfile(
  workspaceId: string,
  profileId: string | null | undefined,
): Promise<void> {
  if (!profileId) return;
  const rows = await db
    .select({ id: profilesTable.id })
    .from(profilesTable)
    .where(and(eq(profilesTable.id, profileId), eq(profilesTable.workspaceId, workspaceId)))
    .limit(1);
  if (!rows[0]) throw new Error("Invalid profile");
}

async function assertSubject(
  workspaceId: string,
  subjectId: string | null | undefined,
): Promise<void> {
  if (!subjectId) return;
  const rows = await db
    .select({ id: subjectsTable.id })
    .from(subjectsTable)
    .where(and(eq(subjectsTable.id, subjectId), eq(subjectsTable.workspaceId, workspaceId)))
    .limit(1);
  if (!rows[0]) throw new Error("Invalid subject");
}

function normalizeProfile(profile: {
  id: string;
  name: string;
  avatar: string;
  accent: string;
}) {
  return {
    id: profile.id,
    name: profile.name,
    avatar: profile.avatar,
    accent: profile.accent,
  };
}

async function authSession(req: Request, workspaceName: string) {
  const context = await currentWorkspaceContext(req);
  const profiles = context
    ? await listWorkspaceProfiles(context.workspace.id)
    : [];
  return GetAuthSessionResponse.parse({
    authenticated: Boolean(context),
    workspaceName,
    profiles: profiles.map(normalizeProfile),
    selectedProfileId: context?.profileId ?? null,
  });
}

function routeContext(res: Response) {
  return getWorkspaceContext(res);
}

router.get("/auth/session", async (req, res): Promise<void> => {
  const workspace = await ensureWorkspace();
  res.json(await authSession(req, workspace.name));
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginToWorkspaceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter the workspace password." });
    return;
  }
  const outcome = await validateWorkspacePassword(req, parsed.data.password);
  if (outcome === "not-configured") {
    res.status(503).json({ error: "The workspace password has not been configured." });
    return;
  }
  if (outcome !== "ok") {
    req.log.warn({ reason: outcome }, "Rejected DuoSpace workspace login");
    res.status(401).json({ error: "That password was not accepted. Try again later." });
    return;
  }
  const workspace = await ensureWorkspace();
  await createWorkspaceSession(workspace.id, res);
  const session = GetAuthSessionResponse.parse({
    authenticated: true,
    workspaceName: workspace.name,
    profiles: (await listWorkspaceProfiles(workspace.id)).map(normalizeProfile),
    selectedProfileId: null,
  });
  res.json(LoginToWorkspaceResponse.parse(session));
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  await revokeCurrentSession(req, res);
  res.sendStatus(204);
});

router.post("/auth/change-password", requireWorkspace, async (req, res): Promise<void> => {
  const parsed = ChangeWorkspacePasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Use a new password with at least 12 characters." });
    return;
  }
  const context = routeContext(res);
  const current = await validateWorkspacePassword(req, parsed.data.currentPassword);
  if (current !== "ok") {
    res.status(current === "blocked" ? 429 : 401).json({ error: "The current password was not accepted." });
    return;
  }
  await updateWorkspacePassword(context.workspace.id, parsed.data.newPassword);
  await db.update(workspaceSessionsTable).set({ revokedAt: new Date() }).where(and(
    eq(workspaceSessionsTable.workspaceId, context.workspace.id),
    isNull(workspaceSessionsTable.revokedAt),
  ));
  res.clearCookie("duospace_session", { httpOnly: true, sameSite: "lax", path: "/" });
  res.sendStatus(204);
});

router.post("/auth/revoke-sessions", requireWorkspace, async (_req, res): Promise<void> => {
  const context = routeContext(res);
  await db.update(workspaceSessionsTable).set({ revokedAt: new Date() }).where(and(
    eq(workspaceSessionsTable.workspaceId, context.workspace.id),
    isNull(workspaceSessionsTable.revokedAt),
  ));
  res.clearCookie("duospace_session", { httpOnly: true, sameSite: "lax", path: "/" });
  res.sendStatus(204);
});

router.post("/auth/select-profile", requireWorkspace, async (req, res): Promise<void> => {
  const parsed = SelectProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const profiles = await listWorkspaceProfiles(context.workspace.id);
  if (!profiles.some((profile) => profile.id === parsed.data.profileId)) {
    res.status(404).json({ error: "Profile not found" });
    return;
  }
  await db
    .update(workspaceSessionsTable)
    .set({ profileId: parsed.data.profileId })
    .where(eq(workspaceSessionsTable.id, context.sessionId));
  res.json(
    SelectProfileResponse.parse(
      await authSession(req, context.workspace.name),
    ),
  );
});

router.get("/events", async (req, res): Promise<void> => {
  const context = await currentWorkspaceContext(req);
  if (!context) {
    res.status(401).end();
    return;
  }
  res.status(200);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  res.write(`event: ready\ndata: ${JSON.stringify({ at: new Date().toISOString() })}\n\n`);
  const listener = (event: { type: string; at: string }) => {
    res.write(`event: change\ndata: ${JSON.stringify(event)}\n\n`);
  };
  liveEvents.on(context.workspace.id, listener);
  const keepAlive = setInterval(() => res.write(": keep-alive\n\n"), 25_000);
  req.on("close", () => {
    clearInterval(keepAlive);
    liveEvents.off(context.workspace.id, listener);
  });
});

router.use(requireWorkspace);

router.use((req, res, next) => {
  if (!["POST", "PATCH", "PUT", "DELETE"].includes(req.method)) {
    next();
    return;
  }
  const context = routeContext(res);
  res.once("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 400) {
      liveEvents.emit(context.workspace.id, {
        type: "workspace.updated",
        at: new Date().toISOString(),
      });
    }
  });
  next();
});

router.get("/workspace/settings", async (_req, res): Promise<void> => {
  const context = routeContext(res);
  const [workspace, profiles] = await Promise.all([
    db.select().from(workspacesTable).where(eq(workspacesTable.id, context.workspace.id)).limit(1),
    listWorkspaceProfiles(context.workspace.id),
  ]);
  const values = (workspace[0]?.settings ?? {}) as Record<string, unknown>;
  res.json(
    GetWorkspaceSettingsResponse.parse({
      name: workspace[0]?.name ?? "DuoSpace",
      timezone: workspace[0]?.timezone ?? "Asia/Kolkata",
      theme: workspace[0]?.theme ?? "dark",
      profiles: profiles.map(normalizeProfile),
      defaultTaskDuration: Number(values.defaultTaskDuration ?? 30),
      focusMinutes: Number(values.focusMinutes ?? 25),
      shortBreakMinutes: Number(values.shortBreakMinutes ?? 5),
      longBreakMinutes: Number(values.longBreakMinutes ?? 15),
    }),
  );
});

router.patch("/workspace/settings", async (req, res): Promise<void> => {
  const parsed = UpdateWorkspaceSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const update = parsed.data;
  if (update.profiles) {
    for (const profile of update.profiles) {
      await db
        .update(profilesTable)
        .set({
          name: profile.name,
          avatar: profile.avatar,
          accent: profile.accent,
          sortOrder: update.profiles.indexOf(profile),
        })
        .where(and(eq(profilesTable.workspaceId, context.workspace.id), eq(profilesTable.id, profile.id)));
    }
  }
  const current = await db
    .select()
    .from(workspacesTable)
    .where(eq(workspacesTable.id, context.workspace.id))
    .limit(1);
  const settings = (current[0]?.settings ?? {}) as Record<string, unknown>;
  const { profiles: _profiles, ...otherSettings } = update;
  const nextSettings = { ...settings, ...otherSettings };
  const updated = await db
    .update(workspacesTable)
    .set({
      name: update.name ?? current[0]?.name,
      timezone: update.timezone ?? current[0]?.timezone,
      theme: update.theme ?? current[0]?.theme,
      settings: nextSettings,
    })
    .where(eq(workspacesTable.id, context.workspace.id))
    .returning();
  await addActivity(context.workspace.id, context.profileId, "settings.updated", "Workspace settings were updated");
  const profiles = await listWorkspaceProfiles(context.workspace.id);
  const saved = updated[0];
  res.json(
    UpdateWorkspaceSettingsResponse.parse({
      name: saved.name,
      timezone: saved.timezone,
      theme: saved.theme,
      profiles: profiles.map(normalizeProfile),
      defaultTaskDuration: Number(nextSettings.defaultTaskDuration ?? 30),
      focusMinutes: Number(nextSettings.focusMinutes ?? 25),
      shortBreakMinutes: Number(nextSettings.shortBreakMinutes ?? 5),
      longBreakMinutes: Number(nextSettings.longBreakMinutes ?? 15),
    }),
  );
});

router.get("/workspace/export", async (_req, res): Promise<void> => {
  const context = routeContext(res);
  const [workspace] = await db.select().from(workspacesTable).where(eq(
    workspacesTable.id,
    context.workspace.id,
  )).limit(1);
  if (!workspace) {
    res.status(404).json({ error: "Workspace not found" });
    return;
  }
  const {
    passwordHash: _passwordHash,
    passwordSalt: _passwordSalt,
    ...safeWorkspace
  } = workspace;
  const [profiles, tasks, calendarEvents, subjects, chapters, goals, habits, habitLogs, journalEntries, focusSessions, notifications, activity] =
    await Promise.all([
      db.select().from(profilesTable).where(eq(profilesTable.workspaceId, context.workspace.id)),
      db.select().from(tasksTable).where(eq(tasksTable.workspaceId, context.workspace.id)),
      db.select().from(calendarEventsTable).where(eq(calendarEventsTable.workspaceId, context.workspace.id)),
      db.select().from(subjectsTable).where(eq(subjectsTable.workspaceId, context.workspace.id)),
      db.select().from(chaptersTable).where(eq(chaptersTable.workspaceId, context.workspace.id)),
      db.select().from(goalsTable).where(eq(goalsTable.workspaceId, context.workspace.id)),
      db.select().from(habitsTable).where(eq(habitsTable.workspaceId, context.workspace.id)),
      db.select().from(habitLogsTable).where(eq(habitLogsTable.workspaceId, context.workspace.id)),
      db.select().from(journalEntriesTable).where(eq(journalEntriesTable.workspaceId, context.workspace.id)),
      db.select().from(focusSessionsTable).where(eq(focusSessionsTable.workspaceId, context.workspace.id)),
      db.select().from(notificationsTable).where(eq(notificationsTable.workspaceId, context.workspace.id)),
      db.select().from(activityEventsTable).where(eq(activityEventsTable.workspaceId, context.workspace.id)),
    ]);
  const data = ExportWorkspaceDataResponse.parse({
    exportedAt: new Date().toISOString(),
    workspace: safeWorkspace,
    profiles,
    tasks,
    calendarEvents,
    subjects,
    chapters,
    goals,
    habits,
    habitLogs,
    journalEntries,
    focusSessions,
    notifications,
    activity,
  });
  res.setHeader("Content-Disposition", 'attachment; filename="duospace-workspace-export.json"');
  res.json(data);
});

router.get("/workspace/dashboard", async (req, res): Promise<void> => {
  const context = routeContext(res);
  const parsed = GetDashboardQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const targetDate = parsed.data.date ?? dateInZone(new Date(), context.workspace.timezone);
  const [allTasks, subjects, chapters, goals, habits, logs, notifications, activities, focus] =
    await Promise.all([
      db.select().from(tasksTable).where(eq(tasksTable.workspaceId, context.workspace.id)).orderBy(asc(tasksTable.dueAt)).limit(250),
      db.select().from(subjectsTable).where(eq(subjectsTable.workspaceId, context.workspace.id)).orderBy(asc(subjectsTable.position)),
      db.select({ subjectId: chaptersTable.subjectId, status: chaptersTable.status }).from(chaptersTable).where(eq(chaptersTable.workspaceId, context.workspace.id)),
      db.select().from(goalsTable).where(eq(goalsTable.workspaceId, context.workspace.id)).orderBy(desc(goalsTable.updatedAt)).limit(8),
      db.select().from(habitsTable).where(eq(habitsTable.workspaceId, context.workspace.id)).orderBy(asc(habitsTable.createdAt)).limit(12),
      db.select().from(habitLogsTable).where(and(eq(habitLogsTable.workspaceId, context.workspace.id), gte(habitLogsTable.logDate, new Date(Date.now() - 35 * 86400_000).toISOString().slice(0, 10)))),
      db.select().from(notificationsTable).where(and(eq(notificationsTable.workspaceId, context.workspace.id), isNull(notificationsTable.readAt))).orderBy(desc(notificationsTable.createdAt)).limit(5),
      db.select().from(activityEventsTable).where(eq(activityEventsTable.workspaceId, context.workspace.id)).orderBy(desc(activityEventsTable.createdAt)).limit(6),
      db.select({ elapsedSeconds: focusSessionsTable.elapsedSeconds }).from(focusSessionsTable).where(and(eq(focusSessionsTable.workspaceId, context.workspace.id), gte(focusSessionsTable.startedAt, new Date(Date.now() - 7 * 86400_000)))),
    ]);
  const activeProfile = context.profileId
    ? await db.select({ name: profilesTable.name }).from(profilesTable).where(eq(profilesTable.id, context.profileId)).limit(1)
    : [];
  const dueToday = allTasks.filter((task) => task.dueAt && dateInZone(task.dueAt, context.workspace.timezone) === targetDate && !["Completed", "Cancelled"].includes(task.status));
  const overdue = allTasks.filter((task) => task.dueAt && dateInZone(task.dueAt, context.workspace.timezone) < targetDate && !["Completed", "Cancelled"].includes(task.status));
  const upcoming = allTasks.filter((task) => task.dueAt && dateInZone(task.dueAt, context.workspace.timezone) > targetDate && !["Completed", "Cancelled"].includes(task.status)).slice(0, 6);
  const subjectDtos = subjects.map((subject) => {
    const ownChapters = chapters.filter((chapter) => chapter.subjectId === subject.id);
    return {
      id: subject.id,
      name: subject.name,
      color: subject.color,
      position: subject.position,
      chapterCount: ownChapters.length,
      completedCount: ownChapters.filter((chapter) => chapter.status === "Revised").length,
    };
  });
  const habitDtos = habits.map((habit) => ({
    id: habit.id,
    title: habit.title,
    frequency: habit.frequency,
    targetDays: habit.targetDays,
    checkIns: logs
      .filter((log) => log.habitId === habit.id && log.completed)
      .map((log) => log.logDate),
    createdAt: habit.createdAt.toISOString(),
  }));
  const openTasks = allTasks.filter((task) => !["Completed", "Cancelled"].includes(task.status));
  const plannedMinutes = dueToday.reduce((sum, task) => sum + task.estimatedMinutes, 0);
  const workload = plannedMinutes <= 150 ? "light" : plannedMinutes <= 360 ? "balanced" : "overloaded";
  const recentActivities = activities.map(async (item) => {
    const profile = item.profileId
      ? await db.select({ name: profilesTable.name }).from(profilesTable).where(eq(profilesTable.id, item.profileId)).limit(1)
      : [];
    return {
      id: item.id,
      action: item.action,
      description: item.description,
      profileName: profile[0]?.name ?? null,
      createdAt: item.createdAt.toISOString(),
    };
  });
  res.json(
    GetDashboardResponse.parse({
      date: targetDate,
      greeting: activeProfile[0]?.name ? `Welcome back, ${activeProfile[0].name}` : "Welcome back",
      tasksDueToday: dueToday.map(taskDto),
      overdueTasks: overdue.map(taskDto),
      upcomingTasks: upcoming.map(taskDto),
      subjects: subjectDtos,
      goals: goals.map((goal) => ({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetDate: goal.targetDate,
        category: goal.category,
        progress: goal.progress,
        createdAt: goal.createdAt.toISOString(),
      })),
      habits: habitDtos,
      notifications: notifications.map((notification) => ({
        id: notification.id,
        kind: notification.kind,
        title: notification.title,
        message: notification.message,
        taskId: notification.taskId,
        readAt: iso(notification.readAt),
        createdAt: notification.createdAt.toISOString(),
      })),
      activity: await Promise.all(recentActivities),
      plannedMinutes,
      completedTasks: allTasks.filter((task) => task.status === "Completed").length,
      openTasks: openTasks.length,
      workload,
      focusMinutesThisWeek: Math.round(focus.reduce((sum, row) => sum + row.elapsedSeconds, 0) / 60),
    }),
  );
});

router.get("/tasks", async (req, res): Promise<void> => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const filters = [eq(tasksTable.workspaceId, context.workspace.id)];
  if (parsed.data.status) filters.push(eq(tasksTable.status, parsed.data.status));
  if (parsed.data.category) filters.push(eq(tasksTable.category, parsed.data.category));
  if (parsed.data.search) filters.push(ilike(tasksTable.title, `%${parsed.data.search}%`));
  const rows = await db.select().from(tasksTable).where(and(...filters)).orderBy(asc(tasksTable.dueAt)).limit(300);
  const today = dateInZone(new Date(), context.workspace.timezone);
  let items = rows;
  if (parsed.data.due === "today") {
    items = rows.filter((task) => task.dueAt && dateInZone(task.dueAt, context.workspace.timezone) === today);
  } else if (parsed.data.due === "overdue") {
    items = rows.filter((task) => task.dueAt && dateInZone(task.dueAt, context.workspace.timezone) < today && !["Completed", "Cancelled"].includes(task.status));
  } else if (parsed.data.due === "upcoming") {
    items = rows.filter((task) => task.dueAt && dateInZone(task.dueAt, context.workspace.timezone) >= today && !["Completed", "Cancelled"].includes(task.status));
  }
  res.json(ListTasksResponse.parse({ items: items.map(taskDto) }));
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  try {
    await assertProfile(context.workspace.id, parsed.data.assignedProfileId);
    await assertSubject(context.workspace.id, parsed.data.subjectId);
  } catch {
    res.status(400).json({ error: "Choose a profile and subject in this workspace." });
    return;
  }
  const [row] = await db
    .insert(tasksTable)
    .values({
      workspaceId: context.workspace.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      subjectId: parsed.data.subjectId,
      dueAt: parsed.data.dueAt ? new Date(parsed.data.dueAt) : null,
      priority: parsed.data.priority,
      status: parsed.data.status,
      estimatedMinutes: parsed.data.estimatedMinutes,
      assignedProfileId: parsed.data.assignedProfileId,
      notes: parsed.data.notes,
      tags: parsed.data.tags ?? [],
      createdByProfileId: context.profileId,
    })
    .returning();
  await addActivity(context.workspace.id, context.profileId, "task.created", `Added “${row.title}”`);
  res.status(201).json(CreateTaskResponse.parse(taskDto(row)));
});

router.patch("/tasks/:taskId", async (req, res): Promise<void> => {
  const params = UpdateTaskParams.safeParse(req.params);
  const parsed = UpdateTaskBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Task update is invalid." });
    return;
  }
  const context = routeContext(res);
  try {
    await assertProfile(context.workspace.id, parsed.data.assignedProfileId);
    await assertSubject(context.workspace.id, parsed.data.subjectId);
  } catch {
    res.status(400).json({ error: "Choose a profile and subject in this workspace." });
    return;
  }
  const prior = await db.select().from(tasksTable).where(and(eq(tasksTable.id, params.data.taskId), eq(tasksTable.workspaceId, context.workspace.id))).limit(1);
  if (!prior[0]) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  const data = parsed.data;
  const patch = {
    ...data,
    ...(data.dueAt !== undefined ? { dueAt: data.dueAt ? new Date(data.dueAt) : null } : {}),
  };
  const [row] = await db
    .update(tasksTable)
    .set(patch)
    .where(and(eq(tasksTable.id, params.data.taskId), eq(tasksTable.workspaceId, context.workspace.id)))
    .returning();
  if (data.status && data.status !== prior[0].status) {
    await addActivity(context.workspace.id, context.profileId, "task.status", `${row.title} marked ${data.status.toLowerCase()}`);
  } else if (data.dueAt !== undefined && iso(prior[0].dueAt) !== iso(row.dueAt)) {
    await addActivity(context.workspace.id, context.profileId, "task.rescheduled", `Rescheduled “${row.title}”`);
  } else if (data.priority && data.priority !== prior[0].priority) {
    await addActivity(context.workspace.id, context.profileId, "task.priority", `Changed priority for “${row.title}”`);
  }
  if (
    (data.status && ["Completed", "Cancelled"].includes(data.status)) ||
    (data.dueAt !== undefined && iso(prior[0].dueAt) !== iso(row.dueAt))
  ) {
    await db.delete(notificationsTable).where(and(eq(notificationsTable.workspaceId, context.workspace.id), eq(notificationsTable.taskId, row.id), isNull(notificationsTable.readAt)));
  }
  res.json(UpdateTaskResponse.parse(taskDto(row)));
});

router.delete("/tasks/:taskId", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.delete(tasksTable).where(and(eq(tasksTable.id, params.data.taskId), eq(tasksTable.workspaceId, context.workspace.id))).returning();
  if (!row) {
    res.status(404).json({ error: "Task not found" });
    return;
  }
  await addActivity(context.workspace.id, context.profileId, "task.deleted", `Removed “${row.title}”`);
  res.sendStatus(204);
});

router.get("/calendar-events", async (req, res): Promise<void> => {
  const parsed = ListCalendarEventsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const filters = [eq(calendarEventsTable.workspaceId, context.workspace.id)];
  if (parsed.data.from) filters.push(gte(calendarEventsTable.startAt, new Date(`${parsed.data.from}T00:00:00.000Z`)));
  if (parsed.data.to) filters.push(lte(calendarEventsTable.startAt, new Date(`${parsed.data.to}T23:59:59.999Z`)));
  const rows = await db.select().from(calendarEventsTable).where(and(...filters)).orderBy(asc(calendarEventsTable.startAt)).limit(400);
  res.json(ListCalendarEventsResponse.parse({ items: rows.map(calendarDto) }));
});

router.post("/calendar-events", async (req, res): Promise<void> => {
  const parsed = CreateCalendarEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  try {
    await assertProfile(context.workspace.id, parsed.data.profileId);
    await assertSubject(context.workspace.id, parsed.data.subjectId);
  } catch {
    res.status(400).json({ error: "Choose a profile and subject in this workspace." });
    return;
  }
  const [row] = await db.insert(calendarEventsTable).values({
    workspaceId: context.workspace.id,
    title: parsed.data.title,
    description: parsed.data.description,
    category: parsed.data.category,
    startAt: new Date(parsed.data.startAt),
    endAt: new Date(parsed.data.endAt),
    allDay: parsed.data.allDay,
    subjectId: parsed.data.subjectId,
    profileId: parsed.data.profileId,
  }).returning();
  await addActivity(context.workspace.id, context.profileId, "event.created", `Scheduled “${row.title}”`);
  res.status(201).json(CreateCalendarEventResponse.parse(calendarDto(row)));
});

router.patch("/calendar-events/:eventId", async (req, res): Promise<void> => {
  const params = UpdateCalendarEventParams.safeParse(req.params);
  const parsed = UpdateCalendarEventBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Event update is invalid." });
    return;
  }
  const context = routeContext(res);
  try {
    await assertProfile(context.workspace.id, parsed.data.profileId);
    await assertSubject(context.workspace.id, parsed.data.subjectId);
  } catch {
    res.status(400).json({ error: "Choose a profile and subject in this workspace." });
    return;
  }
  const [existing] = await db.select().from(calendarEventsTable).where(and(eq(calendarEventsTable.id, params.data.eventId), eq(calendarEventsTable.workspaceId, context.workspace.id))).limit(1);
  if (!existing) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  const data = parsed.data;
  const [row] = await db.update(calendarEventsTable).set({
    ...data,
    ...(data.startAt ? { startAt: new Date(data.startAt) } : {}),
    ...(data.endAt ? { endAt: new Date(data.endAt) } : {}),
  }).where(and(eq(calendarEventsTable.id, params.data.eventId), eq(calendarEventsTable.workspaceId, context.workspace.id))).returning();
  await addActivity(context.workspace.id, context.profileId, "event.updated", `Updated “${row.title}”`);
  res.json(UpdateCalendarEventResponse.parse(calendarDto(row)));
});

router.delete("/calendar-events/:eventId", async (req, res): Promise<void> => {
  const params = DeleteCalendarEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.delete(calendarEventsTable).where(and(eq(calendarEventsTable.id, params.data.eventId), eq(calendarEventsTable.workspaceId, context.workspace.id))).returning();
  if (!row) {
    res.status(404).json({ error: "Event not found" });
    return;
  }
  await addActivity(context.workspace.id, context.profileId, "event.deleted", `Removed “${row.title}”`);
  res.sendStatus(204);
});

router.get("/subjects", async (_req, res): Promise<void> => {
  const context = routeContext(res);
  const [rows, chapters] = await Promise.all([
    db.select().from(subjectsTable).where(eq(subjectsTable.workspaceId, context.workspace.id)).orderBy(asc(subjectsTable.position)),
    db.select({ subjectId: chaptersTable.subjectId, status: chaptersTable.status }).from(chaptersTable).where(eq(chaptersTable.workspaceId, context.workspace.id)),
  ]);
  res.json(ListSubjectsResponse.parse({
    items: rows.map((subject) => {
      const own = chapters.filter((chapter) => chapter.subjectId === subject.id);
      return {
        id: subject.id,
        name: subject.name,
        color: subject.color,
        position: subject.position,
        chapterCount: own.length,
        completedCount: own.filter((chapter) => chapter.status === "Revised").length,
      };
    }),
  }));
});

router.post("/subjects", async (req, res): Promise<void> => {
  const parsed = CreateSubjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const existing = await db.select({ id: subjectsTable.id }).from(subjectsTable).where(eq(subjectsTable.workspaceId, context.workspace.id));
  const [row] = await db.insert(subjectsTable).values({
    workspaceId: context.workspace.id,
    name: parsed.data.name,
    color: parsed.data.color,
    position: existing.length,
  }).returning();
  await addActivity(context.workspace.id, context.profileId, "subject.created", `Added ${row.name}`);
  res.status(201).json(CreateSubjectResponse.parse({
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    chapterCount: 0,
    completedCount: 0,
  }));
});

router.patch("/subjects/:subjectId", async (req, res): Promise<void> => {
  const params = UpdateSubjectParams.safeParse(req.params);
  const parsed = UpdateSubjectBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Subject update is invalid." });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.update(subjectsTable).set(parsed.data).where(and(
    eq(subjectsTable.id, params.data.subjectId),
    eq(subjectsTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  const chapters = await db.select({ status: chaptersTable.status }).from(chaptersTable).where(eq(chaptersTable.subjectId, row.id));
  res.json(UpdateSubjectResponse.parse({
    id: row.id,
    name: row.name,
    color: row.color,
    position: row.position,
    chapterCount: chapters.length,
    completedCount: chapters.filter((chapter) => chapter.status === "Revised").length,
  }));
});

router.delete("/subjects/:subjectId", async (req, res): Promise<void> => {
  const params = DeleteSubjectParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.delete(subjectsTable).where(and(
    eq(subjectsTable.id, params.data.subjectId),
    eq(subjectsTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Subject not found" });
    return;
  }
  await addActivity(context.workspace.id, context.profileId, "subject.deleted", `Removed ${row.name}`);
  res.sendStatus(204);
});

router.get("/chapters", async (req, res): Promise<void> => {
  const parsed = ListChaptersQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const filters = [eq(chaptersTable.workspaceId, context.workspace.id)];
  if (parsed.data.subjectId) filters.push(eq(chaptersTable.subjectId, parsed.data.subjectId));
  const rows = await db.select().from(chaptersTable).where(and(...filters)).orderBy(asc(chaptersTable.position), asc(chaptersTable.createdAt)).limit(500);
  res.json(ListChaptersResponse.parse({
    items: rows.map((row) => ({
      id: row.id,
      subjectId: row.subjectId,
      title: row.title,
      status: row.status,
      notes: row.notes,
      confidence: row.confidence,
      lastStudiedAt: row.lastStudiedAt,
      revisionDate: row.revisionDate,
      position: row.position,
    })),
  }));
});

router.post("/chapters", async (req, res): Promise<void> => {
  const parsed = CreateChapterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  try {
    await assertSubject(context.workspace.id, parsed.data.subjectId);
  } catch {
    res.status(400).json({ error: "Choose a subject in this workspace." });
    return;
  }
  const [row] = await db.insert(chaptersTable).values({
    ...parsed.data,
    lastStudiedAt: dateOnly(parsed.data.lastStudiedAt),
    revisionDate: dateOnly(parsed.data.revisionDate),
    workspaceId: context.workspace.id,
    position: 0,
  }).returning();
  await addActivity(context.workspace.id, context.profileId, "chapter.created", `Added chapter “${row.title}”`);
  res.status(201).json(CreateChapterResponse.parse({
    id: row.id,
    subjectId: row.subjectId,
    title: row.title,
    status: row.status,
    notes: row.notes,
    confidence: row.confidence,
    lastStudiedAt: row.lastStudiedAt,
    revisionDate: row.revisionDate,
    position: row.position,
  }));
});

router.patch("/chapters/:chapterId", async (req, res): Promise<void> => {
  const params = UpdateChapterParams.safeParse(req.params);
  const parsed = UpdateChapterBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Chapter update is invalid." });
    return;
  }
  const context = routeContext(res);
  const { lastStudiedAt, revisionDate, ...chapterUpdate } = parsed.data;
  const [row] = await db.update(chaptersTable).set({
    ...chapterUpdate,
    ...(lastStudiedAt !== undefined ? { lastStudiedAt: dateOnly(lastStudiedAt) } : {}),
    ...(revisionDate !== undefined ? { revisionDate: dateOnly(revisionDate) } : {}),
  }).where(and(
    eq(chaptersTable.id, params.data.chapterId),
    eq(chaptersTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }
  await addActivity(context.workspace.id, context.profileId, "chapter.updated", `Updated “${row.title}”`);
  res.json(UpdateChapterResponse.parse({
    id: row.id,
    subjectId: row.subjectId,
    title: row.title,
    status: row.status,
    notes: row.notes,
    confidence: row.confidence,
    lastStudiedAt: row.lastStudiedAt,
    revisionDate: row.revisionDate,
    position: row.position,
  }));
});

router.delete("/chapters/:chapterId", async (req, res): Promise<void> => {
  const params = DeleteChapterParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.delete(chaptersTable).where(and(
    eq(chaptersTable.id, params.data.chapterId),
    eq(chaptersTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Chapter not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/goals", async (_req, res): Promise<void> => {
  const context = routeContext(res);
  const rows = await db.select().from(goalsTable).where(eq(goalsTable.workspaceId, context.workspace.id)).orderBy(asc(goalsTable.targetDate), desc(goalsTable.createdAt)).limit(200);
  res.json(ListGoalsResponse.parse({
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      targetDate: row.targetDate,
      category: row.category,
      progress: row.progress,
      createdAt: row.createdAt.toISOString(),
    })),
  }));
});

router.post("/goals", async (req, res): Promise<void> => {
  const parsed = CreateGoalBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.insert(goalsTable).values({
    ...parsed.data,
    targetDate: dateOnly(parsed.data.targetDate),
    workspaceId: context.workspace.id,
    progress: parsed.data.progress ?? 0,
  }).returning();
  await addActivity(context.workspace.id, context.profileId, "goal.created", `Started a shared goal: ${row.title}`);
  res.status(201).json(CreateGoalResponse.parse({
    id: row.id,
    title: row.title,
    description: row.description,
    targetDate: row.targetDate,
    category: row.category,
    progress: row.progress,
    createdAt: row.createdAt.toISOString(),
  }));
});

router.patch("/goals/:goalId", async (req, res): Promise<void> => {
  const params = UpdateGoalParams.safeParse(req.params);
  const parsed = UpdateGoalBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Goal update is invalid." });
    return;
  }
  const context = routeContext(res);
  const { targetDate, ...goalUpdate } = parsed.data;
  const [row] = await db.update(goalsTable).set({
    ...goalUpdate,
    ...(targetDate !== undefined ? { targetDate: dateOnly(targetDate) } : {}),
  }).where(and(
    eq(goalsTable.id, params.data.goalId),
    eq(goalsTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  await addActivity(context.workspace.id, context.profileId, "goal.updated", `Updated shared goal “${row.title}”`);
  res.json(UpdateGoalResponse.parse({
    id: row.id,
    title: row.title,
    description: row.description,
    targetDate: row.targetDate,
    category: row.category,
    progress: row.progress,
    createdAt: row.createdAt.toISOString(),
  }));
});

router.delete("/goals/:goalId", async (req, res): Promise<void> => {
  const params = DeleteGoalParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.delete(goalsTable).where(and(
    eq(goalsTable.id, params.data.goalId),
    eq(goalsTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Goal not found" });
    return;
  }
  await addActivity(context.workspace.id, context.profileId, "goal.deleted", `Removed goal “${row.title}”`);
  res.sendStatus(204);
});

router.get("/habits", async (_req, res): Promise<void> => {
  const context = routeContext(res);
  const [habits, logs] = await Promise.all([
    db.select().from(habitsTable).where(eq(habitsTable.workspaceId, context.workspace.id)).orderBy(asc(habitsTable.createdAt)).limit(200),
    db.select().from(habitLogsTable).where(and(
      eq(habitLogsTable.workspaceId, context.workspace.id),
      gte(habitLogsTable.logDate, new Date(Date.now() - 90 * 86400_000).toISOString().slice(0, 10)),
    )).orderBy(asc(habitLogsTable.logDate)),
  ]);
  res.json(ListHabitsResponse.parse({
    items: habits.map((habit) => ({
      id: habit.id,
      title: habit.title,
      frequency: habit.frequency,
      targetDays: habit.targetDays,
      checkIns: logs.filter((log) => log.habitId === habit.id && log.completed).map((log) => log.logDate),
      createdAt: habit.createdAt.toISOString(),
    })),
  }));
});

router.post("/habits", async (req, res): Promise<void> => {
  const parsed = CreateHabitBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.insert(habitsTable).values({
    workspaceId: context.workspace.id,
    title: parsed.data.title,
    frequency: parsed.data.frequency,
    targetDays: parsed.data.targetDays,
  }).returning();
  await addActivity(context.workspace.id, context.profileId, "habit.created", `Added the habit “${row.title}”`);
  res.status(201).json(CreateHabitResponse.parse({
    id: row.id,
    title: row.title,
    frequency: row.frequency,
    targetDays: row.targetDays,
    checkIns: [],
    createdAt: row.createdAt.toISOString(),
  }));
});

router.patch("/habits/:habitId", async (req, res): Promise<void> => {
  const params = UpdateHabitParams.safeParse(req.params);
  const parsed = UpdateHabitBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Habit update is invalid." });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.update(habitsTable).set(parsed.data).where(and(
    eq(habitsTable.id, params.data.habitId),
    eq(habitsTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  const logs = await db.select({ logDate: habitLogsTable.logDate }).from(habitLogsTable).where(and(
    eq(habitLogsTable.habitId, row.id),
    eq(habitLogsTable.completed, true),
  )).orderBy(asc(habitLogsTable.logDate));
  res.json(UpdateHabitResponse.parse({
    id: row.id,
    title: row.title,
    frequency: row.frequency,
    targetDays: row.targetDays,
    checkIns: logs.map((log) => log.logDate),
    createdAt: row.createdAt.toISOString(),
  }));
});

router.delete("/habits/:habitId", async (req, res): Promise<void> => {
  const params = DeleteHabitParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.delete(habitsTable).where(and(
    eq(habitsTable.id, params.data.habitId),
    eq(habitsTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  res.sendStatus(204);
});

router.post("/habits/:habitId/check-ins", async (req, res): Promise<void> => {
  const params = CreateHabitCheckInParams.safeParse(req.params);
  const parsed = CreateHabitCheckInBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Habit check-in is invalid." });
    return;
  }
  const context = routeContext(res);
  const [habit] = await db.select().from(habitsTable).where(and(
    eq(habitsTable.id, params.data.habitId),
    eq(habitsTable.workspaceId, context.workspace.id),
  )).limit(1);
  if (!habit) {
    res.status(404).json({ error: "Habit not found" });
    return;
  }
  if (parsed.data.completed) {
    await db.insert(habitLogsTable).values({
      workspaceId: context.workspace.id,
      habitId: habit.id,
      logDate: dateOnly(parsed.data.date) ?? new Date().toISOString().slice(0, 10),
      completed: true,
      profileId: context.profileId,
    }).onConflictDoUpdate({
      target: [habitLogsTable.habitId, habitLogsTable.logDate],
      set: { completed: true, profileId: context.profileId },
    });
  } else {
    await db.delete(habitLogsTable).where(and(
      eq(habitLogsTable.workspaceId, context.workspace.id),
      eq(habitLogsTable.habitId, habit.id),
      eq(habitLogsTable.logDate, dateOnly(parsed.data.date) ?? ""),
    ));
  }
  await addActivity(context.workspace.id, context.profileId, "habit.checkin", `${parsed.data.completed ? "Checked in" : "Removed check-in"} for “${habit.title}”`);
  const logs = await db.select({ logDate: habitLogsTable.logDate }).from(habitLogsTable).where(and(
    eq(habitLogsTable.habitId, habit.id),
    eq(habitLogsTable.completed, true),
  )).orderBy(asc(habitLogsTable.logDate));
  res.json(CreateHabitCheckInResponse.parse({
    id: habit.id,
    title: habit.title,
    frequency: habit.frequency,
    targetDays: habit.targetDays,
    checkIns: logs.map((log) => log.logDate),
    createdAt: habit.createdAt.toISOString(),
  }));
});

router.get("/journal-entries", async (_req, res): Promise<void> => {
  const context = routeContext(res);
  const rows = await db.select().from(journalEntriesTable).where(eq(journalEntriesTable.workspaceId, context.workspace.id)).orderBy(desc(journalEntriesTable.entryDate), desc(journalEntriesTable.createdAt)).limit(200);
  res.json(ListJournalEntriesResponse.parse({
    items: rows.map((row) => ({
      id: row.id,
      title: row.title,
      content: row.content,
      entryDate: row.entryDate,
      mood: row.mood,
      tags: row.tags,
      createdByProfileId: row.createdByProfileId,
      createdAt: row.createdAt.toISOString(),
    })),
  }));
});

router.post("/journal-entries", async (req, res): Promise<void> => {
  const parsed = CreateJournalEntryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.insert(journalEntriesTable).values({
    ...parsed.data,
    entryDate: dateOnly(parsed.data.entryDate) ?? new Date().toISOString().slice(0, 10),
    workspaceId: context.workspace.id,
    tags: parsed.data.tags ?? [],
    createdByProfileId: context.profileId,
  }).returning();
  await addActivity(context.workspace.id, context.profileId, "journal.created", `Wrote a journal entry: ${row.title}`);
  res.status(201).json(CreateJournalEntryResponse.parse({
    id: row.id,
    title: row.title,
    content: row.content,
    entryDate: row.entryDate,
    mood: row.mood,
    tags: row.tags,
    createdByProfileId: row.createdByProfileId,
    createdAt: row.createdAt.toISOString(),
  }));
});

router.patch("/journal-entries/:entryId", async (req, res): Promise<void> => {
  const params = UpdateJournalEntryParams.safeParse(req.params);
  const parsed = UpdateJournalEntryBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Journal update is invalid." });
    return;
  }
  const context = routeContext(res);
  const { entryDate, ...entryUpdate } = parsed.data;
  const [row] = await db.update(journalEntriesTable).set({
    ...entryUpdate,
    ...(entryDate !== undefined ? { entryDate: dateOnly(entryDate) ?? undefined } : {}),
  }).where(and(
    eq(journalEntriesTable.id, params.data.entryId),
    eq(journalEntriesTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Journal entry not found" });
    return;
  }
  res.json(UpdateJournalEntryResponse.parse({
    id: row.id,
    title: row.title,
    content: row.content,
    entryDate: row.entryDate,
    mood: row.mood,
    tags: row.tags,
    createdByProfileId: row.createdByProfileId,
    createdAt: row.createdAt.toISOString(),
  }));
});

router.delete("/journal-entries/:entryId", async (req, res): Promise<void> => {
  const params = DeleteJournalEntryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.delete(journalEntriesTable).where(and(
    eq(journalEntriesTable.id, params.data.entryId),
    eq(journalEntriesTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Journal entry not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/focus-sessions", async (req, res): Promise<void> => {
  const parsed = ListFocusSessionsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const filters = [eq(focusSessionsTable.workspaceId, context.workspace.id)];
  if (parsed.data.from) filters.push(gte(focusSessionsTable.startedAt, new Date(`${parsed.data.from}T00:00:00.000Z`)));
  if (parsed.data.to) filters.push(lte(focusSessionsTable.startedAt, new Date(`${parsed.data.to}T23:59:59.999Z`)));
  const rows = await db.select().from(focusSessionsTable).where(and(...filters)).orderBy(desc(focusSessionsTable.createdAt)).limit(250);
  const items = rows.map((row) => {
    return {
      id: row.id,
      status: row.status,
      taskId: row.taskId,
      subjectId: row.subjectId,
      startedAt: row.startedAt.toISOString(),
      endedAt: iso(row.endedAt),
      elapsedSeconds: row.elapsedSeconds,
      notes: row.notes,
    };
  });
  res.json(ListFocusSessionsResponse.parse({
    items,
    totalSeconds: items.reduce((sum, row) => sum + row.elapsedSeconds, 0),
  }));
});

router.post("/focus-sessions", async (req, res): Promise<void> => {
  const parsed = CreateFocusSessionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  const existing = await db.select({ id: focusSessionsTable.id }).from(focusSessionsTable).where(and(
    eq(focusSessionsTable.workspaceId, context.workspace.id),
    eq(focusSessionsTable.status, "running"),
  )).limit(1);
  if (existing[0]) {
    res.status(409).json({ error: "A focus session is already running." });
    return;
  }
  try {
    await assertSubject(context.workspace.id, parsed.data.subjectId);
  } catch {
    res.status(400).json({ error: "Choose a subject in this workspace." });
    return;
  }
  const now = new Date();
  const [row] = await db.insert(focusSessionsTable).values({
    workspaceId: context.workspace.id,
    profileId: context.profileId,
    taskId: parsed.data.taskId,
    subjectId: parsed.data.subjectId,
    startedAt: now,
    status: "running",
    notes: parsed.data.notes,
  }).returning();
  res.status(201).json(CreateFocusSessionResponse.parse({
    id: row.id,
    status: row.status,
    taskId: row.taskId,
    subjectId: row.subjectId,
    startedAt: row.startedAt.toISOString(),
    endedAt: null,
    elapsedSeconds: 0,
    notes: row.notes,
  }));
});

router.patch("/focus-sessions/:sessionId", async (req, res): Promise<void> => {
  const params = UpdateFocusSessionParams.safeParse(req.params);
  const parsed = UpdateFocusSessionBody.safeParse(req.body);
  if (!params.success || !parsed.success) {
    res.status(400).json({ error: "Focus session update is invalid." });
    return;
  }
  const context = routeContext(res);
  const [prior] = await db.select().from(focusSessionsTable).where(and(
    eq(focusSessionsTable.id, params.data.sessionId),
    eq(focusSessionsTable.workspaceId, context.workspace.id),
  )).limit(1);
  if (!prior) {
    res.status(404).json({ error: "Focus session not found" });
    return;
  }
  const now = new Date();
  const status = parsed.data.status;
  let elapsedSeconds = prior.elapsedSeconds;
  let startedAt = prior.startedAt;
  let endedAt: Date | null = null;
  if (prior.status === "running" && status !== "running") {
    elapsedSeconds += Math.max(0, Math.floor((now.getTime() - prior.startedAt.getTime()) / 1000));
    if (status === "completed" || status === "interrupted") endedAt = now;
  } else if (prior.status === "paused" && status === "running") {
    startedAt = now;
  } else {
    elapsedSeconds = Math.max(elapsedSeconds, parsed.data.elapsedSeconds);
    if (status === "completed" || status === "interrupted") endedAt = now;
  }
  const [row] = await db.update(focusSessionsTable).set({
    status,
    startedAt,
    endedAt,
    elapsedSeconds,
    notes: parsed.data.notes ?? prior.notes,
  }).where(and(
    eq(focusSessionsTable.id, params.data.sessionId),
    eq(focusSessionsTable.workspaceId, context.workspace.id),
  )).returning();
  res.json(UpdateFocusSessionResponse.parse({
    id: row.id,
    status: row.status,
    taskId: row.taskId,
    subjectId: row.subjectId,
    startedAt: row.startedAt.toISOString(),
    endedAt: iso(row.endedAt),
    elapsedSeconds: row.elapsedSeconds,
    notes: row.notes,
  }));
});

async function processDueReminders(workspaceId: string): Promise<void> {
  const now = new Date();
  const openTasks = await db.select().from(tasksTable).where(and(
    eq(tasksTable.workspaceId, workspaceId),
    inArray(tasksTable.status, ["Not Started", "In Progress"]),
  )).limit(500);
  const existing = await db.select({ dedupeKey: notificationsTable.dedupeKey }).from(notificationsTable).where(eq(notificationsTable.workspaceId, workspaceId));
  const dedupeKeys = new Set(existing.map((row) => row.dedupeKey));
  const inserts: Array<typeof notificationsTable.$inferInsert> = [];
  for (const task of openTasks) {
    if (!task.dueAt) continue;
    const dueMs = task.dueAt.getTime();
    const delta = dueMs - now.getTime();
    const dueKey = task.dueAt.toISOString();
    const candidates = [
      ...(delta <= 24 * 3600_000 && delta > 2 * 3600_000
        ? [{ kind: "deadline_soon", code: "day", title: "Due tomorrow", message: `“${task.title}” is due within a day.` }]
        : []),
      ...(delta <= 2 * 3600_000 && delta > 0
        ? [{ kind: "deadline_soon", code: "two_hour", title: "Due in a few hours", message: `“${task.title}” is due in about two hours.` }]
        : []),
      ...(delta <= 0 && delta >= -60_000
        ? [{ kind: "due_now", code: "due_now", title: "Due now", message: `“${task.title}” is due now and still needs attention.` }]
        : []),
      ...(delta < -60_000
        ? [{ kind: "overdue", code: "overdue", title: "Task overdue", message: `“${task.title}” is past its deadline.` }]
        : []),
    ];
    for (const item of candidates) {
      const dedupeKey = `${task.id}:${dueKey}:${item.code}`;
      if (dedupeKeys.has(dedupeKey)) continue;
      dedupeKeys.add(dedupeKey);
      inserts.push({
        workspaceId,
        kind: item.kind,
        title: item.title,
        message: item.message,
        taskId: task.id,
        dedupeKey,
      });
    }
  }
  if (inserts.length) {
    await db.insert(notificationsTable).values(inserts).onConflictDoNothing();
    liveEvents.emit(workspaceId, { type: "notifications.created", at: now.toISOString() });
  }
}

router.get("/notifications", async (req, res): Promise<void> => {
  const parsed = ListNotificationsQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const context = routeContext(res);
  await processDueReminders(context.workspace.id);
  const rows = await db.select({
    notification: notificationsTable,
    taskStatus: tasksTable.status,
  }).from(notificationsTable).leftJoin(tasksTable, eq(notificationsTable.taskId, tasksTable.id)).where(eq(
    notificationsTable.workspaceId,
    context.workspace.id,
  )).orderBy(desc(notificationsTable.createdAt)).limit(200);
  const relevant = rows.filter((row) => {
    if (row.notification.taskId && ["Completed", "Cancelled"].includes(row.taskStatus ?? "")) return false;
    if (parsed.data.unreadOnly && row.notification.readAt) return false;
    return true;
  });
  res.json(ListNotificationsResponse.parse({
    items: relevant.map(({ notification }) => ({
      id: notification.id,
      kind: notification.kind,
      title: notification.title,
      message: notification.message,
      taskId: notification.taskId,
      readAt: iso(notification.readAt),
      createdAt: notification.createdAt.toISOString(),
    })),
    unreadCount: relevant.filter((row) => !row.notification.readAt).length,
  }));
});

router.post("/notifications/:notificationId/read", async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const context = routeContext(res);
  const [row] = await db.update(notificationsTable).set({ readAt: new Date() }).where(and(
    eq(notificationsTable.id, params.data.notificationId),
    eq(notificationsTable.workspaceId, context.workspace.id),
  )).returning();
  if (!row) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(MarkNotificationReadResponse.parse({
    id: row.id,
    kind: row.kind,
    title: row.title,
    message: row.message,
    taskId: row.taskId,
    readAt: iso(row.readAt),
    createdAt: row.createdAt.toISOString(),
  }));
});

router.get("/activity", async (_req, res): Promise<void> => {
  const context = routeContext(res);
  const rows = await db.select().from(activityEventsTable).where(eq(
    activityEventsTable.workspaceId,
    context.workspace.id,
  )).orderBy(desc(activityEventsTable.createdAt)).limit(100);
  const profileIds = [...new Set(rows.map((row) => row.profileId).filter((id): id is string => Boolean(id)))];
  const profiles = profileIds.length
    ? await db.select({ id: profilesTable.id, name: profilesTable.name }).from(profilesTable).where(inArray(profilesTable.id, profileIds))
    : [];
  const profileNames = new Map(profiles.map((profile) => [profile.id, profile.name]));
  res.json(ListActivityResponse.parse({
    items: rows.map((row) => ({
      id: row.id,
      action: row.action,
      description: row.description,
      profileName: row.profileId ? profileNames.get(row.profileId) ?? null : null,
      createdAt: row.createdAt.toISOString(),
    })),
  }));
});

export async function processWorkspaceReminders(): Promise<void> {
  try {
    const workspaces = await db.select({ id: workspacesTable.id }).from(workspacesTable);
    for (const workspace of workspaces) await processDueReminders(workspace.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    // This job has no request context; keep logs free of reminder or journal content.
    process.stderr.write(`DuoSpace reminder processing failed: ${message}\n`);
  }
}

export function startWorkspaceEventStreamHeartbeat(): void {
  void processWorkspaceReminders();
  setInterval(() => void processWorkspaceReminders(), 60_000).unref();
}

export default router;
