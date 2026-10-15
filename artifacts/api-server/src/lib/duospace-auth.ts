import {
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { and, eq, gt, isNull } from "drizzle-orm";
import {
  db,
  loginAttemptsTable,
  profilesTable,
  subjectsTable,
  workspacesTable,
  workspaceSessionsTable,
  type Profile,
  type Workspace,
} from "@workspace/db";

const SESSION_COOKIE = "duospace_session";
const SESSION_LIFETIME_MS = 7 * 24 * 60 * 60 * 1000;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_BLOCK_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 6;

export type WorkspaceContext = {
  workspace: Workspace;
  profileId: string | null;
  sessionId: string;
};

declare global {
  namespace Express {
    interface Locals {
      workspaceContext?: WorkspaceContext;
    }
  }
}

let workspacePromise: Promise<Workspace> | null = null;

function sessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not configured");
  return secret;
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function hashIp(ip: string): string {
  return createHmac("sha256", sessionSecret()).update(ip).digest("hex");
}

function safePasswordEqual(candidate: string, expected: string): boolean {
  const a = createHash("sha256").update(candidate).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b);
}

function deriveWorkspacePassword(password: string, salt: string): Buffer {
  return scryptSync(password, `${sessionSecret()}:${salt}`, 64);
}

export async function ensureWorkspace(): Promise<Workspace> {
  if (!workspacePromise) {
    workspacePromise = (async () => {
      const existing = await db.select().from(workspacesTable).limit(1);
      let workspace = existing[0];
      if (!workspace) {
        const created = await db
          .insert(workspacesTable)
          .values({ name: "DuoSpace", timezone: "Asia/Kolkata", theme: "dark" })
          .returning();
        workspace = created[0];
      }

      if (!workspace.passwordHash && process.env.DUOSPACE_WORKSPACE_PASSWORD) {
        const salt = randomBytes(16).toString("hex");
        const passwordHash = deriveWorkspacePassword(
          process.env.DUOSPACE_WORKSPACE_PASSWORD,
          salt,
        ).toString("hex");
        const [secured] = await db
          .update(workspacesTable)
          .set({ passwordHash, passwordSalt: salt })
          .where(eq(workspacesTable.id, workspace.id))
          .returning();
        workspace = secured;
      }

      const profiles = await db
        .select({ id: profilesTable.id })
        .from(profilesTable)
        .where(eq(profilesTable.workspaceId, workspace.id));
      if (profiles.length === 0) {
        await db.insert(profilesTable).values([
          {
            workspaceId: workspace.id,
            name: "Profile 1",
            avatar: "sun",
            accent: "#9b8cff",
            sortOrder: 0,
          },
          {
            workspaceId: workspace.id,
            name: "Profile 2",
            avatar: "moon",
            accent: "#54c8ed",
            sortOrder: 1,
          },
        ]);
      }
      const subjects = await db
        .select({ id: subjectsTable.id })
        .from(subjectsTable)
        .where(eq(subjectsTable.workspaceId, workspace.id));
      if (subjects.length === 0) {
        await db.insert(subjectsTable).values([
          { workspaceId: workspace.id, name: "Physics", color: "#9b8cff", position: 0 },
          { workspaceId: workspace.id, name: "Chemistry", color: "#53c7eb", position: 1 },
          { workspaceId: workspace.id, name: "Mathematics", color: "#faad62", position: 2 },
          { workspaceId: workspace.id, name: "Computer Science", color: "#79d7a1", position: 3 },
          { workspaceId: workspace.id, name: "English Core", color: "#ff8c9f", position: 4 },
          { workspaceId: workspace.id, name: "Artificial Intelligence", color: "#68a7ff", position: 5 },
        ]);
      }
      return workspace;
    })().catch((error: unknown) => {
      workspacePromise = null;
      throw error;
    });
  }
  return workspacePromise;
}

export async function listWorkspaceProfiles(workspaceId: string): Promise<Profile[]> {
  return db
    .select()
    .from(profilesTable)
    .where(eq(profilesTable.workspaceId, workspaceId))
    .orderBy(profilesTable.sortOrder);
}

export async function currentWorkspaceContext(
  req: Request,
): Promise<WorkspaceContext | null> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token !== "string" || token.length < 32) return null;
  const now = new Date();
  const rows = await db
    .select({
      sessionId: workspaceSessionsTable.id,
      workspaceId: workspaceSessionsTable.workspaceId,
      profileId: workspaceSessionsTable.profileId,
    })
    .from(workspaceSessionsTable)
    .where(
      and(
        eq(workspaceSessionsTable.tokenHash, hashSessionToken(token)),
        isNull(workspaceSessionsTable.revokedAt),
        gt(workspaceSessionsTable.expiresAt, now),
      ),
    )
    .limit(1);
  const session = rows[0];
  if (!session) return null;
  const workspace = await ensureWorkspace();
  if (workspace.id !== session.workspaceId) return null;
  return {
    workspace,
    profileId: session.profileId,
    sessionId: session.sessionId,
  };
}

export async function requireWorkspace(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const context = await currentWorkspaceContext(req);
    if (!context) {
      res.status(401).json({ error: "Workspace session required" });
      return;
    }
    res.locals.workspaceContext = context;
    next();
  } catch (error) {
    next(error);
  }
}

export function getWorkspaceContext(res: Response): WorkspaceContext {
  const context = res.locals.workspaceContext;
  if (!context) throw new Error("Workspace authorization middleware was not applied");
  return context;
}

export async function createWorkspaceSession(
  workspaceId: string,
  res: Response,
): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_LIFETIME_MS);
  await db.insert(workspaceSessionsTable).values({
    workspaceId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function revokeCurrentSession(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (typeof token === "string") {
    await db
      .update(workspaceSessionsTable)
      .set({ revokedAt: new Date() })
      .where(
        and(
          eq(workspaceSessionsTable.tokenHash, hashSessionToken(token)),
          isNull(workspaceSessionsTable.revokedAt),
        ),
      );
  }
  res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function validateWorkspacePassword(
  req: Request,
  candidate: string,
): Promise<"ok" | "invalid" | "blocked" | "not-configured"> {
  const workspace = await ensureWorkspace();
  const expected = process.env.DUOSPACE_WORKSPACE_PASSWORD;
  if (!workspace.passwordHash && !expected) return "not-configured";
  const ip = hashIp(req.ip || "unknown");
  const now = new Date();
  const rows = await db
    .select()
    .from(loginAttemptsTable)
    .where(eq(loginAttemptsTable.ipHash, ip))
    .limit(1);
  const attempt = rows[0];

  if (attempt?.blockedUntil && attempt.blockedUntil > now) return "blocked";
  const windowExpired =
    !attempt || now.getTime() - attempt.windowStartedAt.getTime() > LOGIN_WINDOW_MS;
  const failedCount = windowExpired ? 0 : attempt.failedCount;

  const candidateHash = workspace.passwordHash && workspace.passwordSalt
    ? deriveWorkspacePassword(candidate, workspace.passwordSalt)
    : null;
  const accepted = candidateHash && workspace.passwordHash
    ? timingSafeEqual(candidateHash, Buffer.from(workspace.passwordHash, "hex"))
    : safePasswordEqual(candidate, expected ?? "");
  if (accepted) {
    if (attempt) {
      await db
        .update(loginAttemptsTable)
        .set({
          failedCount: 0,
          windowStartedAt: now,
          blockedUntil: null,
        })
        .where(eq(loginAttemptsTable.ipHash, ip));
    }
    return "ok";
  }

  const nextCount = failedCount + 1;
  const blockedUntil =
    nextCount >= MAX_FAILED_LOGINS ? new Date(now.getTime() + LOGIN_BLOCK_MS) : null;
  if (attempt) {
    await db
      .update(loginAttemptsTable)
      .set({
        failedCount: nextCount,
        windowStartedAt: windowExpired ? now : attempt.windowStartedAt,
        blockedUntil,
      })
      .where(eq(loginAttemptsTable.ipHash, ip));
  } else {
    await db.insert(loginAttemptsTable).values({
      ipHash: ip,
      failedCount: nextCount,
      windowStartedAt: now,
      blockedUntil,
    });
  }
  return "invalid";
}

export async function updateWorkspacePassword(
  workspaceId: string,
  password: string,
): Promise<void> {
  const salt = randomBytes(16).toString("hex");
  const passwordHash = deriveWorkspacePassword(password, salt).toString("hex");
  await db
    .update(workspacesTable)
    .set({ passwordHash, passwordSalt: salt })
    .where(eq(workspacesTable.id, workspaceId));
}
