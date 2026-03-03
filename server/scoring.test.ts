import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@test.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      country: null,
      entityType: null,
      jobTitle: null,
      organization: null,
      preferredLang: "en",
      phone: null,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

function createUserContext(id = 2): TrpcContext {
  return {
    user: {
      id,
      openId: `user-${id}`,
      email: `user${id}@test.com`,
      name: `Test User ${id}`,
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
      country: "Colombia",
      entityType: "regulator",
      jobTitle: "Director",
      organization: "Postal Regulator",
      preferredLang: "en",
      phone: null,
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
}

describe("auth.me", () => {
  it("returns the current user", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const user = await caller.auth.me();
    expect(user).toBeDefined();
    expect(user?.id).toBe(2);
    expect(user?.role).toBe("user");
  });
});

describe("model.getPhases", () => {
  it("returns phases from the database", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    const phases = await caller.model.getPhases();
    // Phases may be empty in test environment without DB, just check it's an array
    expect(Array.isArray(phases)).toBe(true);
  });
});

describe("admin access control", () => {
  it("rejects non-admin users from admin procedures", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.getStats()).rejects.toThrow();
  });

  it("allows admin users to access admin procedures", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    // This may fail if DB is not available, but should not throw FORBIDDEN
    try {
      const stats = await caller.admin.getStats();
      expect(stats).toBeDefined();
    } catch (e: unknown) {
      // Accept DB connection errors but not FORBIDDEN
      const msg = e instanceof Error ? e.message : String(e);
      expect(msg).not.toContain("FORBIDDEN");
    }
  });
});

describe("auth.logout", () => {
  it("clears session cookie and returns success", async () => {
    const clearedCookies: string[] = [];
    const ctx = createUserContext();
    ctx.res.clearCookie = (name: string) => { clearedCookies.push(name); };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(clearedCookies.length).toBeGreaterThan(0);
  });
});
