import {
  boolean,
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const workspacesTable = pgTable("duospace_workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().default("DuoSpace"),
  timezone: text("timezone").notNull().default("Asia/Kolkata"),
  theme: text("theme").notNull().default("dark"),
  passwordHash: text("password_hash"),
  passwordSalt: text("password_salt"),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const profilesTable = pgTable(
  "duospace_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    avatar: text("avatar").notNull().default("spark"),
    accent: text("accent").notNull().default("#8b7cff"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("duospace_profiles_workspace_idx").on(table.workspaceId)],
);

export const subjectsTable = pgTable(
  "duospace_subjects",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    color: text("color").notNull().default("#8b7cff"),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("duospace_subjects_workspace_idx").on(table.workspaceId)],
);

export const chaptersTable = pgTable(
  "duospace_chapters",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    subjectId: uuid("subject_id").notNull().references(() => subjectsTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: text("status").notNull().default("Not Started"),
    notes: text("notes"),
    confidence: integer("confidence"),
    lastStudiedAt: date("last_studied_at", { mode: "string" }),
    revisionDate: date("revision_date", { mode: "string" }),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("duospace_chapters_subject_idx").on(table.workspaceId, table.subjectId)],
);

export const tasksTable = pgTable(
  "duospace_tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("Other"),
    subjectId: uuid("subject_id").references(() => subjectsTable.id, { onDelete: "set null" }),
    dueAt: timestamp("due_at", { withTimezone: true }),
    priority: text("priority").notNull().default("Medium"),
    status: text("status").notNull().default("Not Started"),
    estimatedMinutes: integer("estimated_minutes").notNull().default(30),
    actualMinutes: integer("actual_minutes"),
    assignedProfileId: uuid("assigned_profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    createdByProfileId: uuid("created_by_profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    notes: text("notes"),
    tags: text("tags").array().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [
    index("duospace_tasks_workspace_due_idx").on(table.workspaceId, table.dueAt),
    index("duospace_tasks_workspace_status_idx").on(table.workspaceId, table.status),
  ],
);

export const calendarEventsTable = pgTable(
  "duospace_calendar_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    category: text("category").notNull().default("Personal"),
    startAt: timestamp("start_at", { withTimezone: true }).notNull(),
    endAt: timestamp("end_at", { withTimezone: true }).notNull(),
    allDay: boolean("all_day").notNull().default(false),
    subjectId: uuid("subject_id").references(() => subjectsTable.id, { onDelete: "set null" }),
    profileId: uuid("profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("duospace_calendar_workspace_start_idx").on(table.workspaceId, table.startAt)],
);

export const goalsTable = pgTable(
  "duospace_goals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description"),
    targetDate: date("target_date", { mode: "string" }),
    category: text("category").notNull().default("Shared"),
    progress: integer("progress").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("duospace_goals_workspace_idx").on(table.workspaceId)],
);

export const habitsTable = pgTable(
  "duospace_habits",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    frequency: text("frequency").notNull().default("daily"),
    targetDays: integer("target_days").array().notNull().default([0, 1, 2, 3, 4, 5, 6]),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("duospace_habits_workspace_idx").on(table.workspaceId)],
);

export const habitLogsTable = pgTable(
  "duospace_habit_logs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    habitId: uuid("habit_id").notNull().references(() => habitsTable.id, { onDelete: "cascade" }),
    logDate: date("log_date", { mode: "string" }).notNull(),
    completed: boolean("completed").notNull().default(true),
    profileId: uuid("profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("duospace_habit_logs_unique_idx").on(table.habitId, table.logDate),
    index("duospace_habit_logs_workspace_date_idx").on(table.workspaceId, table.logDate),
  ],
);

export const journalEntriesTable = pgTable(
  "duospace_journal_entries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    content: text("content").notNull().default(""),
    entryDate: date("entry_date", { mode: "string" }).notNull(),
    mood: text("mood"),
    tags: text("tags").array().notNull().default([]),
    createdByProfileId: uuid("created_by_profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("duospace_journal_workspace_date_idx").on(table.workspaceId, table.entryDate)],
);

export const focusSessionsTable = pgTable(
  "duospace_focus_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    taskId: uuid("task_id").references(() => tasksTable.id, { onDelete: "set null" }),
    subjectId: uuid("subject_id").references(() => subjectsTable.id, { onDelete: "set null" }),
    status: text("status").notNull().default("running"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
    endedAt: timestamp("ended_at", { withTimezone: true }),
    elapsedSeconds: integer("elapsed_seconds").notNull().default(0),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [index("duospace_focus_workspace_started_idx").on(table.workspaceId, table.startedAt)],
);

export const workspaceSessionsTable = pgTable(
  "duospace_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("duospace_sessions_expiry_idx").on(table.expiresAt)],
);

export const loginAttemptsTable = pgTable(
  "duospace_login_attempts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ipHash: text("ip_hash").notNull(),
    failedCount: integer("failed_count").notNull().default(0),
    windowStartedAt: timestamp("window_started_at", { withTimezone: true }).notNull().defaultNow(),
    blockedUntil: timestamp("blocked_until", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("duospace_login_attempt_ip_idx").on(table.ipHash)],
);

export const notificationsTable = pgTable(
  "duospace_notifications",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    taskId: uuid("task_id").references(() => tasksTable.id, { onDelete: "cascade" }),
    dedupeKey: text("dedupe_key").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("duospace_notifications_dedupe_idx").on(table.workspaceId, table.dedupeKey),
    index("duospace_notifications_unread_idx").on(table.workspaceId, table.readAt),
  ],
);

export const activityEventsTable = pgTable(
  "duospace_activity_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workspaceId: uuid("workspace_id").notNull().references(() => workspacesTable.id, { onDelete: "cascade" }),
    profileId: uuid("profile_id").references(() => profilesTable.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    description: text("description").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("duospace_activity_workspace_created_idx").on(table.workspaceId, table.createdAt)],
);

export const workspaceInsertSchema = createInsertSchema(workspacesTable);
export const profileInsertSchema = createInsertSchema(profilesTable);
export const subjectInsertSchema = createInsertSchema(subjectsTable);
export const chapterInsertSchema = createInsertSchema(chaptersTable);
export const taskInsertSchema = createInsertSchema(tasksTable);
export const calendarEventInsertSchema = createInsertSchema(calendarEventsTable);
export const goalInsertSchema = createInsertSchema(goalsTable);
export const habitInsertSchema = createInsertSchema(habitsTable);
export const habitLogInsertSchema = createInsertSchema(habitLogsTable);
export const journalEntryInsertSchema = createInsertSchema(journalEntriesTable);
export const focusSessionInsertSchema = createInsertSchema(focusSessionsTable);
export const notificationInsertSchema = createInsertSchema(notificationsTable);
export type Workspace = typeof workspacesTable.$inferSelect;
export type Profile = typeof profilesTable.$inferSelect;
export type Task = typeof tasksTable.$inferSelect;
export type Subject = typeof subjectsTable.$inferSelect;
export type Chapter = typeof chaptersTable.$inferSelect;
export type CalendarEvent = typeof calendarEventsTable.$inferSelect;
export type Goal = typeof goalsTable.$inferSelect;
export type Habit = typeof habitsTable.$inferSelect;
export type JournalEntry = typeof journalEntriesTable.$inferSelect;
export type FocusSession = typeof focusSessionsTable.$inferSelect;
export type Notification = typeof notificationsTable.$inferSelect;
export type ActivityEvent = typeof activityEventsTable.$inferSelect;
export type InputZod = z.ZodTypeAny;
