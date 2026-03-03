import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  computeAndStoreBenchmark,
  createAssessment,
  createGuestSession,
  createProviderContact,
  getActionProgressForAssessment,
  getActiveProviders,
  getAllGuestSessions,
  getAllPhases,
  getAllQuestionsWithPhases,
  getAllProviderContacts,
  getAllUsers,
  getAnswersForAssessment,
  getAssessmentById,
  getCompletedGuestSessions,
  getGuestSessionByToken,
  getGuestSessionByEmail,
  getLatestBenchmark,
  getPlatformStats,
  getProviderById,
  getUserAssessments,
  saveAnswer,
  updateAssessmentProgress,
  updateGuestSession,
  updateUserProfile,
  upsertActionProgress,
  upsertUser,
} from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { generateAssessmentAnalysis, generateCommercialPlan, type AssessmentAnalysisInput } from "./analysis";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";

// ─── Scoring Engine ───────────────────────────────────────────────────────────

function computeScores(
  answersData: { questionId: number; value: string | null }[],
  questionsData: { question: { id: number; questionType: string; weight: string; phaseId: number }; phase: { slug: string } }[]
) {
  const answerMap = new Map(answersData.map((a) => [a.questionId, parseFloat(a.value ?? "0")]));
  const phaseScores: Record<string, { total: number; max: number }> = {};

  for (const { question, phase } of questionsData) {
    const raw = answerMap.get(question.id) ?? 0;
    const weight = parseFloat(question.weight);
    const maxVal = question.questionType === "scale" ? 5 : 1;
    const normalized = (raw / maxVal) * 100 * weight;
    const maxNorm = 100 * weight;

    if (!phaseScores[phase.slug]) phaseScores[phase.slug] = { total: 0, max: 0 };
    phaseScores[phase.slug].total += normalized;
    phaseScores[phase.slug].max += maxNorm;
  }

  const byPhase: Record<string, number> = {};
  for (const [slug, { total, max }] of Object.entries(phaseScores)) {
    byPhase[slug] = max > 0 ? Math.round((total / max) * 100) : 0;
  }

  const phaseValues = Object.values(byPhase);
  const global = phaseValues.length > 0
    ? Math.round(phaseValues.reduce((a, b) => a + b, 0) / phaseValues.length)
    : 0;

  return { global, byPhase };
}

function getMaturityLevel(score: number): string {
  if (score < 20) return "initial";
  if (score < 40) return "developing";
  if (score < 60) return "defined";
  if (score < 80) return "managed";
  return "optimized";
}

function generateActionPlan(
  scores: { global: number; byPhase: Record<string, number> },
  phases: { slug: string; titleEs: string; titleEn: string }[]
) {
  const actions: {
    id: string; phaseSlug: string; titleEs: string; titleEn: string;
    descriptionEs: string; descriptionEn: string;
    priority: "high" | "medium" | "low"; horizon: "short" | "medium" | "long";
    effort: "high" | "medium" | "low"; impact: "high" | "medium" | "low";
  }[] = [];

  const ACTION_TEMPLATES: Record<string, {
    titleEs: string; titleEn: string; descriptionEs: string; descriptionEn: string;
    effort: "high" | "medium" | "low"; impact: "high" | "medium" | "low";
  }[]> = {
    phase1: [
      { titleEs: "Diseñar metodología de medición E2E", titleEn: "Design E2E measurement methodology",
        descriptionEs: "Definir metodología alineada con UPU S58/S59 y EN 13850 para garantizar comparabilidad internacional.",
        descriptionEn: "Define methodology aligned with UPU S58/S59 and EN 13850 to ensure international comparability.",
        effort: "high", impact: "high" },
      { titleEs: "Reclutar y capacitar red de panelistas", titleEn: "Recruit and train panelist network",
        descriptionEs: "Seleccionar panelistas con cobertura geográfica representativa y establecer protocolos operativos.",
        descriptionEn: "Select panelists with representative geographic coverage and establish operational protocols.",
        effort: "medium", impact: "high" },
      { titleEs: "Implementar plataforma tecnológica de datos", titleEn: "Implement data technology platform",
        descriptionEs: "Desplegar plataforma centralizada para integrar datos de panelistas y red RFID con dashboards automáticos.",
        descriptionEn: "Deploy centralized platform to integrate panelist data and RFID network with automatic dashboards.",
        effort: "high", impact: "high" },
    ],
    phase2: [
      { titleEs: "Elaborar inventario completo del ecosistema postal", titleEn: "Develop complete postal ecosystem inventory",
        descriptionEs: "Documentar todos los operadores, carriers, nodos y flujos del sistema postal nacional.",
        descriptionEn: "Document all operators, carriers, nodes and flows of the national postal system.",
        effort: "medium", impact: "high" },
      { titleEs: "Definir topología territorial de medición", titleEn: "Define territorial measurement topology",
        descriptionEs: "Estructurar el territorio en zonas de medición con pares origen-destino representativos.",
        descriptionEn: "Structure the territory in measurement zones with representative origin-destination pairs.",
        effort: "medium", impact: "medium" },
    ],
    phase3: [
      { titleEs: "Ejecutar período de medición de línea base", titleEn: "Execute baseline measurement period",
        descriptionEs: "Operar el sistema durante 3-6 meses en modo observación para obtener la primera fotografía objetiva del servicio.",
        descriptionEn: "Operate the system for 3-6 months in observation mode to obtain the first objective snapshot of service.",
        effort: "high", impact: "high" },
      { titleEs: "Definir y formalizar SLAs por servicio y zona", titleEn: "Define and formalize SLAs by service and zone",
        descriptionEs: "Establecer objetivos de tiempo de tránsito y porcentajes de cumplimiento basados en datos reales.",
        descriptionEn: "Establish transit time objectives and compliance percentages based on real data.",
        effort: "medium", impact: "high" },
    ],
    phase4: [
      { titleEs: "Diseñar e implementar red RFID en nodos críticos", titleEn: "Design and implement RFID network at critical nodes",
        descriptionEs: "Instalar lectores RFID en centros de clasificación y puntos de intercambio para diagnóstico granular.",
        descriptionEn: "Install RFID readers at sorting centers and exchange points for granular diagnosis.",
        effort: "high", impact: "high" },
      { titleEs: "Configurar análisis de tiempos por segmento", titleEn: "Configure segment time analysis",
        descriptionEs: "Implementar cálculo automático de tiempos por nodo y tramo para identificar cuellos de botella.",
        descriptionEn: "Implement automatic calculation of times per node and segment to identify bottlenecks.",
        effort: "medium", impact: "high" },
    ],
    phase5: [
      { titleEs: "Establecer operación continua del sistema", titleEn: "Establish continuous system operation",
        descriptionEs: "Pasar de mediciones puntuales a operación permanente con procedimientos estándar documentados.",
        descriptionEn: "Move from point measurements to permanent operation with documented standard procedures.",
        effort: "medium", impact: "high" },
      { titleEs: "Implementar sistema de alertas automáticas", titleEn: "Implement automatic alert system",
        descriptionEs: "Configurar alertas por incumplimiento de SLA con protocolo de respuesta y escalamiento definidos.",
        descriptionEn: "Configure alerts for SLA non-compliance with defined response and escalation protocol.",
        effort: "medium", impact: "high" },
      { titleEs: "Publicar resultados de calidad postal", titleEn: "Publish postal quality results",
        descriptionEs: "Establecer canal de publicación transparente de resultados para generar rendición de cuentas.",
        descriptionEn: "Establish transparent publication channel for results to generate accountability.",
        effort: "low", impact: "medium" },
    ],
    phase6: [
      { titleEs: "Realizar análisis de causa raíz de retrasos", titleEn: "Conduct root cause analysis of delays",
        descriptionEs: "Contratar consultor especializado para identificar causas operativas reales de los problemas detectados.",
        descriptionEn: "Hire specialized consultant to identify real operational causes of detected problems.",
        effort: "high", impact: "high" },
      { titleEs: "Diseñar planes de mejora formales", titleEn: "Design formal improvement plans",
        descriptionEs: "Elaborar planes con acciones, responsables, plazos e indicadores de éxito vinculados al régimen sancionador.",
        descriptionEn: "Develop plans with actions, responsible parties, deadlines and success indicators linked to the sanctioning regime.",
        effort: "medium", impact: "high" },
    ],
    phase7: [
      { titleEs: "Participar en benchmarking internacional UPU", titleEn: "Participate in UPU international benchmarking",
        descriptionEs: "Incorporarse a programas internacionales de medición para comparar resultados y adoptar mejores prácticas.",
        descriptionEn: "Join international measurement programs to compare results and adopt best practices.",
        effort: "medium", impact: "medium" },
      { titleEs: "Ampliar cobertura a servicios de e-commerce", titleEn: "Expand coverage to e-commerce services",
        descriptionEs: "Extender el sistema de medición para incluir paquetería, última milla y servicios de comercio electrónico.",
        descriptionEn: "Extend the measurement system to include parcels, last mile and e-commerce services.",
        effort: "high", impact: "medium" },
    ],
  };

  // Sort phases by score ascending (lowest first = highest priority)
  const sortedPhases = [...phases].sort((a, b) => (scores.byPhase[a.slug] ?? 0) - (scores.byPhase[b.slug] ?? 0));

  let actionId = 1;
  for (const phase of sortedPhases.slice(0, 5)) {
    const score = scores.byPhase[phase.slug] ?? 0;
    const templates = ACTION_TEMPLATES[phase.slug] ?? [];
    const horizon: "short" | "medium" | "long" = score < 30 ? "short" : score < 60 ? "medium" : "long";
    const priority: "high" | "medium" | "low" = score < 30 ? "high" : score < 60 ? "medium" : "low";

    for (const tmpl of templates.slice(0, 2)) {
      actions.push({ id: `action-${actionId++}`, phaseSlug: phase.slug, ...tmpl, priority, horizon });
    }
  }

  return actions.slice(0, 7);
}

// ─── Router ───────────────────────────────────────────────────────────────────

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ─── User Profile ──────────────────────────────────────────────────────────
  user: router({
    updateProfile: protectedProcedure
      .input(z.object({
        country: z.string().optional(),
        entityType: z.enum(["regulator", "public_operator", "private_operator", "consultant", "other"]).optional(),
        jobTitle: z.string().optional(),
        organization: z.string().optional(),
        preferredLang: z.enum(["es", "en"]).optional(),
        phone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),
  }),

  // ─── Maturity Model ────────────────────────────────────────────────────────
  model: router({
    getPhases: publicProcedure.query(async () => {
      return getAllPhases();
    }),

    getAllQuestions: publicProcedure.query(async () => {
      return getAllQuestionsWithPhases();
    }),
  }),

  // ─── Assessments ──────────────────────────────────────────────────────────
  assessment: router({
    create: protectedProcedure.mutation(async ({ ctx }) => {
      await createAssessment(ctx.user.id);
      const assessmentsList = await getUserAssessments(ctx.user.id);
      return assessmentsList[0];
    }),

    getMyAssessments: protectedProcedure.query(async ({ ctx }) => {
      return getUserAssessments(ctx.user.id);
    }),

    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ ctx, input }) => {
        const assessment = await getAssessmentById(input.id);
        if (!assessment) throw new TRPCError({ code: "NOT_FOUND" });
        if (assessment.userId !== ctx.user.id && ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return assessment;
      }),

    saveAnswer: protectedProcedure
      .input(z.object({
        assessmentId: z.number(),
        questionId: z.number(),
        value: z.number(),
        currentPhaseIndex: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const assessment = await getAssessmentById(input.assessmentId);
        if (!assessment || assessment.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });
        await saveAnswer(input.assessmentId, input.questionId, input.value);
        if (input.currentPhaseIndex !== undefined) {
          await updateAssessmentProgress(input.assessmentId, { currentPhaseIndex: input.currentPhaseIndex });
        }
        return { success: true };
      }),

    complete: protectedProcedure
      .input(z.object({ assessmentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const assessment = await getAssessmentById(input.assessmentId);
        if (!assessment || assessment.userId !== ctx.user.id) throw new TRPCError({ code: "FORBIDDEN" });

        const answersData = await getAnswersForAssessment(input.assessmentId);
        const questionsData = await getAllQuestionsWithPhases();
        const phasesData = await getAllPhases();

        const scores = computeScores(answersData, questionsData);
        const gaps = Object.entries(scores.byPhase)
          .map(([slug, score]) => ({ phaseSlug: slug, score, gap: 100 - score }))
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 3);

        const actionPlan = generateActionPlan(scores, phasesData);

        await updateAssessmentProgress(input.assessmentId, {
          status: "completed",
          scores,
          gaps,
          actionPlan,
          completedAt: new Date(),
        });

        // Recompute benchmark
        await computeAndStoreBenchmark();

        return { scores, gaps, actionPlan };
      }),

    getAnswers: protectedProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ ctx, input }) => {
        const assessment = await getAssessmentById(input.assessmentId);
        if (!assessment || (assessment.userId !== ctx.user.id && ctx.user.role !== "admin")) {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return getAnswersForAssessment(input.assessmentId);
      }),
  }),

  // ─── Action Progress ───────────────────────────────────────────────────────
  progress: router({
    getForAssessment: protectedProcedure
      .input(z.object({ assessmentId: z.number() }))
      .query(async ({ ctx, input }) => {
        return getActionProgressForAssessment(input.assessmentId, ctx.user.id);
      }),

    upsert: protectedProcedure
      .input(z.object({
        assessmentId: z.number(),
        actionId: z.string(),
        completed: z.boolean(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await upsertActionProgress({
          assessmentId: input.assessmentId,
          userId: ctx.user.id,
          actionId: input.actionId,
          completed: input.completed,
          notes: input.notes,
          completedAt: input.completed ? new Date() : undefined,
        });
        return { success: true };
      }),
  }),

  // ─── Benchmark ─────────────────────────────────────────────────────────────
  benchmark: router({
    getLatest: protectedProcedure.query(async () => {
      return getLatestBenchmark();
    }),
  }),

  // ─── Market ────────────────────────────────────────────────────────────────
  market: router({
    getProviders: publicProcedure.query(async () => {
      return getActiveProviders();
    }),

    contactProvider: protectedProcedure
      .input(z.object({
        providerId: z.number(),
        assessmentId: z.number().optional(),
        message: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const provider = await getProviderById(input.providerId);
        if (!provider) throw new TRPCError({ code: "NOT_FOUND" });

        const leadProfile = {
          userId: ctx.user.id,
          name: ctx.user.name,
          email: ctx.user.email,
          organization: ctx.user.organization,
          country: ctx.user.country,
          entityType: ctx.user.entityType,
          jobTitle: ctx.user.jobTitle,
        };

        await createProviderContact({
          providerId: input.providerId,
          userId: ctx.user.id,
          assessmentId: input.assessmentId,
          message: input.message,
          leadProfile,
        });

        return { success: true };
      }),
  }),

  // ─── Guest Sessions ────────────────────────────────────────────────────────
  guest: router({
    // Create or get a session token for an email
    saveProgress: publicProcedure
      .input(z.object({
        email: z.string().email(),
        currentPhaseIndex: z.number(),
        answers: z.record(z.string(), z.number()),
        token: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        let token = input.token;
        if (token) {
          const existing = await getGuestSessionByToken(token);
          if (existing) {
            await updateGuestSession(token, {
              currentPhaseIndex: input.currentPhaseIndex,
              answers: input.answers,
            });
            return { token, isNew: false };
          }
        }
        // Create new session
        token = await createGuestSession(input.email);
        await updateGuestSession(token, {
          currentPhaseIndex: input.currentPhaseIndex,
          answers: input.answers,
        });
        return { token, isNew: true };
      }),

    // Resume a session by token
    getSession: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const session = await getGuestSessionByToken(input.token);
        if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found or expired" });
        return session;
      }),

    // Look up a completed session by email to restore results
    lookupByEmail: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const session = await getGuestSessionByEmail(input.email);
        if (!session || session.status !== "completed" || !session.scores) {
          return { found: false, token: null, scores: null, gaps: null, actionPlan: null, name: null, organization: null, country: null, entityType: null };
        }
        return {
          found: true,
          token: session.token,
          scores: session.scores as { global: number; byPhase: Record<string, number> },
          gaps: session.gaps as { phaseSlug: string; score: number; gap: number }[],
          actionPlan: session.actionPlan as unknown[],
          name: session.name,
          organization: session.organization,
          country: session.country,
          entityType: session.entityType,
        };
      }),
    // Complete a guest session with scores and contact info
    complete: publicProcedure
      .input(z.object({
        token: z.string().optional(),
        answers: z.record(z.string(), z.number()),
        name: z.string(),
        organization: z.string(),
        country: z.string().optional(),
        entityType: z.enum(["regulator", "public_operator", "private_operator", "consultant", "other"]).optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ input }) => {
        // If no token, create an ephemeral session using name as email fallback
        let resolvedToken = input.token;
        if (!resolvedToken) {
          const ephemeralEmail = input.email ?? `${input.name.toLowerCase().replace(/\s+/g, '.')}.${Date.now()}@anonymous.netdiscover`;
          resolvedToken = await createGuestSession(ephemeralEmail);
        }
        const session = await getGuestSessionByToken(resolvedToken);
        if (!session) throw new TRPCError({ code: "NOT_FOUND" });

        const questionsData = await getAllQuestionsWithPhases();
        const phasesData = await getAllPhases();

        // Convert answers from {questionId: value} to array format
        const answersArray = Object.entries(input.answers).map(([qId, val]) => ({
          questionId: parseInt(qId),
          value: String(val),
        }));

        const scores = computeScores(answersArray, questionsData);
        const gaps = Object.entries(scores.byPhase)
          .map(([slug, score]) => ({ phaseSlug: slug, score, gap: 100 - score }))
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 3);
        const actionPlan = generateActionPlan(scores, phasesData);

        await updateGuestSession(resolvedToken!, {
          answers: input.answers,
          scores,
          gaps,
          actionPlan,
          name: input.name,
          organization: input.organization,
          country: input.country,
          entityType: input.entityType,
          status: "completed",
          completedAt: new Date(),
        });

        // Recompute benchmark with guest data included
        await computeAndStoreBenchmark();

        return { scores, gaps, actionPlan };
      }),
  }),

  // ─── Analysis (LLM) ───────────────────────────────────────────────────────
  analysis: router({
    generate: publicProcedure
      .input(z.object({
        answers: z.record(z.string(), z.number()),
        institution: z.string(),
        entityType: z.enum(["regulator", "designated_operator"]),
        country: z.string().optional(),
        respondentName: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const questionsData = await getAllQuestionsWithPhases();
        const phasesData = await getAllPhases();

        const answersArray = Object.entries(input.answers).map(([qId, val]) => ({
          questionId: parseInt(qId),
          value: String(val),
        }));

        const scores = computeScores(answersArray, questionsData);
        const gaps = Object.entries(scores.byPhase)
          .map(([slug, score]) => ({ phaseSlug: slug, score, gap: 100 - score }))
          .sort((a, b) => b.gap - a.gap)
          .slice(0, 3);

        // Build phase names map
        const phaseNames: Record<string, string> = {};
        for (const p of phasesData) {
          phaseNames[p.slug] = p.titleEn ?? p.slug;
        }

        // Build answers with question text for LLM context
        const answersWithContext = questionsData
          .filter(q => input.answers[q.question.id] !== undefined)
          .map(q => ({
            phaseSlug: q.phase.slug,
            phaseName: phaseNames[q.phase.slug] ?? q.phase.slug,
            questionText: q.question.textEn ?? q.question.textEs ?? "",
            value: input.answers[q.question.id],
            questionType: q.question.questionType,
          }));

        const analysisInput: AssessmentAnalysisInput = {
          institution: input.institution,
          entityType: input.entityType,
          country: input.country,
          respondentName: input.respondentName,
          globalScore: scores.global,
          phaseScores: scores.byPhase,
          phaseNames,
          topGaps: gaps,
          answersWithContext,
        };

        const [technicalAnalysis, commercialPlan] = await Promise.all([
          generateAssessmentAnalysis(analysisInput),
          generateCommercialPlan(analysisInput),
        ]);

        return { technicalAnalysis, commercialPlan, scores, gaps };
      }),
  }),

  // ─── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    getStats: adminProcedure.query(async () => {
      return getPlatformStats();
    }),

    getUsers: adminProcedure
      .input(z.object({ limit: z.number().default(100), offset: z.number().default(0) }))
      .query(async ({ input }) => {
        return getAllUsers(input.limit, input.offset);
      }),

    getLeads: adminProcedure.query(async () => {
      return getAllProviderContacts();
    }),

    recomputeBenchmark: adminProcedure.mutation(async () => {
      await computeAndStoreBenchmark();
      return { success: true };
    }),

    getGuestLeads: adminProcedure.query(async () => {
      return getAllGuestSessions();
    }),

    getCompletedGuestLeads: adminProcedure.query(async () => {
      return getCompletedGuestSessions();
    }),
  }),
});

export type AppRouter = typeof appRouter;
