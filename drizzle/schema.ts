import {
  boolean,
  decimal,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

// ─── Users & Organizations ────────────────────────────────────────────────────

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  // Extended profile
  country: varchar("country", { length: 100 }),
  entityType: mysqlEnum("entityType", ["regulator", "public_operator", "private_operator", "consultant", "other"]),
  jobTitle: varchar("jobTitle", { length: 200 }),
  organization: varchar("organization", { length: 200 }),
  preferredLang: mysqlEnum("preferredLang", ["es", "en"]).default("es").notNull(),
  phone: varchar("phone", { length: 50 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Guest Sessions (anonymous progress saving) ───────────────────────────────

export const guestSessions = mysqlTable("guestSessions", {
  id: int("id").autoincrement().primaryKey(),
  // Unique token sent by email to resume the session
  token: varchar("token", { length: 128 }).notNull().unique(),
  email: varchar("email", { length: 320 }).notNull(),
  // Optional contact info collected at end
  name: varchar("name", { length: 200 }),
  organization: varchar("organization", { length: 200 }),
  country: varchar("country", { length: 100 }),
  entityType: mysqlEnum("entityType", ["regulator", "public_operator", "private_operator", "consultant", "other"]),
  // Current phase index (0-6) when saved
  currentPhaseIndex: int("currentPhaseIndex").default(0).notNull(),
  // Answers stored as JSON: { questionId: value, ... }
  answers: json("answers"),
  // Computed results once completed
  scores: json("scores"),
  gaps: json("gaps"),
  actionPlan: json("actionPlan"),
  status: mysqlEnum("status", ["in_progress", "completed"]).default("in_progress").notNull(),
  // Whether benchmark email has been sent
  benchmarkEmailSent: boolean("benchmarkEmailSent").default(false).notNull(),
  completedAt: timestamp("completedAt"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GuestSession = typeof guestSessions.$inferSelect;

// ─── Maturity Model ───────────────────────────────────────────────────────────

export const phases = mysqlTable("phases", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  orderIndex: int("orderIndex").notNull(),
  titleEs: varchar("titleEs", { length: 200 }).notNull(),
  titleEn: varchar("titleEn", { length: 200 }).notNull(),
  descriptionEs: text("descriptionEs"),
  descriptionEn: text("descriptionEn"),
  icon: varchar("icon", { length: 50 }),
  color: varchar("color", { length: 20 }),
  // If true, this phase is excluded from maturity scoring (e.g. Phase 0 context)
  scoringExcluded: boolean("scoringExcluded").default(false).notNull(),
  titleFr: varchar("titleFr", { length: 200 }),
  descriptionFr: text("descriptionFr"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Phase = typeof phases.$inferSelect;

export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  phaseId: int("phaseId").notNull(),
  orderIndex: int("orderIndex").notNull(),
  slug: varchar("slug", { length: 100 }).notNull().unique(),
  textEs: text("textEs").notNull(),
  textEn: text("textEn").notNull(),
  helpEs: text("helpEs"),
  helpEn: text("helpEn"),
  questionType: mysqlEnum("questionType", ["yes_no", "scale", "multiple_choice", "barrier"]).default("scale").notNull(),
  weight: decimal("weight", { precision: 4, scale: 2 }).default("1.00").notNull(),
  // For multiple_choice/barrier: JSON array of {value, labelEs, labelEn, labelFr}
  options: json("options"),
  // French text
  textFr: text("textFr"),
  helpFr: text("helpFr"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Question = typeof questions.$inferSelect;

// ─── Assessments ──────────────────────────────────────────────────────────────

export const assessments = mysqlTable("assessments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  status: mysqlEnum("status", ["in_progress", "completed"]).default("in_progress").notNull(),
  currentPhaseIndex: int("currentPhaseIndex").default(0).notNull(),
  completedAt: timestamp("completedAt"),
  // Computed scores stored as JSON: { global: number, byPhase: {phaseSlug: number} }
  scores: json("scores"),
  // Top gaps: [{phaseSlug, score, gap}]
  gaps: json("gaps"),
  // Action plan: [{id, titleEs, titleEn, phaseSlug, priority, horizon, effort, impact}]
  actionPlan: json("actionPlan"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Assessment = typeof assessments.$inferSelect;

export const answers = mysqlTable("answers", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  questionId: int("questionId").notNull(),
  // Numeric value: yes_no -> 0 or 1; scale -> 1-4; barrier -> 0 (not scored)
  value: decimal("value", { precision: 5, scale: 2 }),
  // For barrier questions: the selected option value as text
  barrierValue: varchar("barrierValue", { length: 200 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Answer = typeof answers.$inferSelect;

// ─── Progress Tracking ────────────────────────────────────────────────────────

export const actionProgress = mysqlTable("actionProgress", {
  id: int("id").autoincrement().primaryKey(),
  assessmentId: int("assessmentId").notNull(),
  userId: int("userId").notNull(),
  // actionId matches the id in assessment.actionPlan JSON
  actionId: varchar("actionId", { length: 64 }).notNull(),
  completed: boolean("completed").default(false).notNull(),
  notes: text("notes"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ActionProgress = typeof actionProgress.$inferSelect;

// ─── Benchmark ────────────────────────────────────────────────────────────────

export const benchmarkSnapshots = mysqlTable("benchmarkSnapshots", {
  id: int("id").autoincrement().primaryKey(),
  region: varchar("region", { length: 100 }).default("global").notNull(),
  entityType: varchar("entityType", { length: 64 }).default("all").notNull(),
  // Aggregated scores: { global: {avg, median, p25, p75, count}, byPhase: {...} }
  data: json("data").notNull(),
  snapshotDate: timestamp("snapshotDate").defaultNow().notNull(),
});

export type BenchmarkSnapshot = typeof benchmarkSnapshots.$inferSelect;

// ─── Market Catalog ───────────────────────────────────────────────────────────

export const marketProviders = mysqlTable("marketProviders", {
  id: int("id").autoincrement().primaryKey(),
  nameEs: varchar("nameEs", { length: 200 }).notNull(),
  nameEn: varchar("nameEn", { length: 200 }).notNull(),
  descriptionEs: text("descriptionEs"),
  descriptionEn: text("descriptionEn"),
  category: mysqlEnum("category", ["technology", "consulting", "training", "measurement", "rfid", "platform", "other"]).notNull(),
  // Which phases this provider helps with (JSON array of phase slugs)
  relevantPhases: json("relevantPhases"),
  website: varchar("website", { length: 500 }),
  contactEmail: varchar("contactEmail", { length: 320 }),
  logoUrl: varchar("logoUrl", { length: 500 }),
  // Case studies: [{titleEs, titleEn, descriptionEs, descriptionEn}]
  caseStudies: json("caseStudies"),
  featured: boolean("featured").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MarketProvider = typeof marketProviders.$inferSelect;

export const providerContacts = mysqlTable("providerContacts", {
  id: int("id").autoincrement().primaryKey(),
  providerId: int("providerId").notNull(),
  userId: int("userId").notNull(),
  assessmentId: int("assessmentId"),
  message: text("message"),
  // Lead profile snapshot at time of contact
  leadProfile: json("leadProfile"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ProviderContact = typeof providerContacts.$inferSelect;
