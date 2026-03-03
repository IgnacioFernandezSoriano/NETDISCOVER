import { and, avg, count, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  actionProgress,
  answers,
  assessments,
  benchmarkSnapshots,
  InsertUser,
  marketProviders,
  phases,
  providerContacts,
  questions,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function updateUserProfile(userId: number, data: {
  country?: string; entityType?: "regulator" | "public_operator" | "private_operator" | "consultant" | "other";
  jobTitle?: string; organization?: string; preferredLang?: "es" | "en"; phone?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

// ─── Maturity Model ───────────────────────────────────────────────────────────

export async function getAllPhases() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(phases).orderBy(phases.orderIndex);
}

export async function getQuestionsForPhase(phaseId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(questions).where(eq(questions.phaseId, phaseId)).orderBy(questions.orderIndex);
}

export async function getAllQuestionsWithPhases() {
  const db = await getDb();
  if (!db) return [];
  const rows = await db
    .select({ question: questions, phase: phases })
    .from(questions)
    .innerJoin(phases, eq(questions.phaseId, phases.id))
    .orderBy(phases.orderIndex, questions.orderIndex);
  // Parse options JSON string → array so the client always receives a proper array
  return rows.map(row => ({
    ...row,
    question: {
      ...row.question,
      options: (() => {
        const o = row.question.options;
        if (Array.isArray(o)) return o;
        if (typeof o === "string" && o.length > 0) {
          try { return JSON.parse(o); } catch { return []; }
        }
        return [];
      })(),
    },
  }));
}

// ─── Assessments ──────────────────────────────────────────────────────────────

export async function createAssessment(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const result = await db.insert(assessments).values({ userId, status: "in_progress", currentPhaseIndex: 0 });
  return result[0];
}

export async function getAssessmentById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(assessments).where(eq(assessments.id, id)).limit(1);
  return result[0];
}

export async function getUserAssessments(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(assessments).where(eq(assessments.userId, userId)).orderBy(desc(assessments.createdAt));
}

export async function updateAssessmentProgress(assessmentId: number, data: {
  currentPhaseIndex?: number; status?: "in_progress" | "completed";
  scores?: unknown; gaps?: unknown; actionPlan?: unknown; completedAt?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(assessments).set(data as Record<string, unknown>).where(eq(assessments.id, assessmentId));
}

export async function saveAnswer(assessmentId: number, questionId: number, value: number) {
  const db = await getDb();
  if (!db) return;
  await db.insert(answers)
    .values({ assessmentId, questionId, value: String(value) })
    .onDuplicateKeyUpdate({ set: { value: String(value) } });
}

export async function getAnswersForAssessment(assessmentId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(answers).where(eq(answers.assessmentId, assessmentId));
}

// ─── Action Progress ──────────────────────────────────────────────────────────

export async function getActionProgressForAssessment(assessmentId: number, userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(actionProgress)
    .where(and(eq(actionProgress.assessmentId, assessmentId), eq(actionProgress.userId, userId)));
}

export async function upsertActionProgress(data: {
  assessmentId: number; userId: number; actionId: string;
  completed: boolean; notes?: string; completedAt?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(actionProgress).values(data)
    .onDuplicateKeyUpdate({ set: { completed: data.completed, notes: data.notes ?? null, completedAt: data.completedAt ?? null } });
}

// ─── Benchmark ────────────────────────────────────────────────────────────────

export async function getLatestBenchmark(region = "global", entityType = "all") {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(benchmarkSnapshots)
    .where(and(eq(benchmarkSnapshots.region, region), eq(benchmarkSnapshots.entityType, entityType)))
    .orderBy(desc(benchmarkSnapshots.snapshotDate)).limit(1);
  return result[0];
}

export async function computeAndStoreBenchmark() {
  const db = await getDb();
  if (!db) return;

  // Get all completed assessments with scores
  const completed = await db.select().from(assessments)
    .where(eq(assessments.status, "completed"));

  if (completed.length === 0) return;

  const phaseRows = await getAllPhases();
  const phaseScores: Record<string, number[]> = {};
  const globalScores: number[] = [];

  for (const a of completed) {
    if (!a.scores) continue;
    const s = a.scores as { global: number; byPhase: Record<string, number> };
    if (s.global) globalScores.push(s.global);
    for (const ph of phaseRows) {
      if (!phaseScores[ph.slug]) phaseScores[ph.slug] = [];
      if (s.byPhase?.[ph.slug] !== undefined) phaseScores[ph.slug].push(s.byPhase[ph.slug]);
    }
  }

  const median = (arr: number[]) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
  };
  const mean = (arr: number[]) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const percentile = (arr: number[], p: number) => {
    if (!arr.length) return 0;
    const sorted = [...arr].sort((a, b) => a - b);
    const idx = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, idx)];
  };

  const buildStats = (arr: number[]) => ({
    avg: Math.round(mean(arr) * 10) / 10,
    median: Math.round(median(arr) * 10) / 10,
    p25: Math.round(percentile(arr, 25) * 10) / 10,
    p75: Math.round(percentile(arr, 75) * 10) / 10,
    count: arr.length,
  });

  const byPhase: Record<string, ReturnType<typeof buildStats>> = {};
  for (const ph of phaseRows) {
    byPhase[ph.slug] = buildStats(phaseScores[ph.slug] ?? []);
  }

  const data = { global: buildStats(globalScores), byPhase };

  await db.insert(benchmarkSnapshots).values({ region: "global", entityType: "all", data });
}

// ─── Market ───────────────────────────────────────────────────────────────────

export async function getActiveProviders() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(marketProviders).where(eq(marketProviders.active, true)).orderBy(desc(marketProviders.featured));
}

export async function getProviderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(marketProviders).where(eq(marketProviders.id, id)).limit(1);
  return result[0];
}

export async function createProviderContact(data: {
  providerId: number; userId: number; assessmentId?: number; message?: string; leadProfile?: unknown;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(providerContacts).values({
    providerId: data.providerId,
    userId: data.userId,
    assessmentId: data.assessmentId,
    message: data.message,
    leadProfile: data.leadProfile,
  });
}

export async function getAllProviderContacts(limit = 200) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(providerContacts).orderBy(desc(providerContacts.createdAt)).limit(limit);
}

// ─── Admin Stats ──────────────────────────────────────────────────────────────

export async function getPlatformStats() {
  const db = await getDb();
  if (!db) return { totalUsers: 0, totalAssessments: 0, completedAssessments: 0, totalContacts: 0 };

  const [totalUsers] = await db.select({ count: count() }).from(users);
  const [totalAssessments] = await db.select({ count: count() }).from(assessments);
  const [completedAssessments] = await db.select({ count: count() }).from(assessments).where(eq(assessments.status, "completed"));
  const [totalContacts] = await db.select({ count: count() }).from(providerContacts);

  return {
    totalUsers: totalUsers?.count ?? 0,
    totalAssessments: totalAssessments?.count ?? 0,
    completedAssessments: completedAssessments?.count ?? 0,
    totalContacts: totalContacts?.count ?? 0,
  };
}

// ─── Guest Sessions (anonymous progress saving) ───────────────────────────────

import { guestSessions } from "../drizzle/schema";
import { nanoid } from "nanoid";

export async function createGuestSession(email: string) {
  const db = await getDb();
  if (!db) throw new Error("DB not available");
  const token = nanoid(32);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  await db.insert(guestSessions).values({ token, email, expiresAt });
  return token;
}

export async function getGuestSessionByToken(token: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(guestSessions).where(eq(guestSessions.token, token)).limit(1);
  return result[0];
}

export async function updateGuestSession(token: string, data: {
  currentPhaseIndex?: number;
  answers?: unknown;
  scores?: unknown;
  gaps?: unknown;
  actionPlan?: unknown;
  status?: "in_progress" | "completed";
  name?: string;
  organization?: string;
  country?: string;
  entityType?: "regulator" | "public_operator" | "private_operator" | "consultant" | "other";
  benchmarkEmailSent?: boolean;
  completedAt?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  await db.update(guestSessions).set(data as Record<string, unknown>).where(eq(guestSessions.token, token));
}

export async function getGuestSessionByEmail(email: string) {
  const db = await getDb();
  if (!db) return undefined;
  // Return the most recently completed session for this email, or the most recent in_progress one
  const completed = await db.select().from(guestSessions)
    .where(and(eq(guestSessions.email, email), eq(guestSessions.status, "completed")))
    .orderBy(desc(guestSessions.completedAt))
    .limit(1);
  if (completed[0]) return completed[0];
  const inProgress = await db.select().from(guestSessions)
    .where(eq(guestSessions.email, email))
    .orderBy(desc(guestSessions.createdAt))
    .limit(1);
  return inProgress[0];
}
export async function getAllGuestSessions(limit = 500) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(guestSessions).orderBy(desc(guestSessions.createdAt)).limit(limit);
}

export async function getCompletedGuestSessions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(guestSessions)
    .where(eq(guestSessions.status, "completed"))
    .orderBy(desc(guestSessions.completedAt));
}
