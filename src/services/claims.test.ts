// src/services/claims.test.ts (or tests/claims.integration.test.ts)
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import { verifyClaim } from "./claims";
import { db } from "../db/client";
import { users, creators, creatorClaims } from "../db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";

// Use test DB
describe("verifyClaim - domain match", () => {
  const verificationUrl = "https://example.com";
  const verificationCode = "TESTCODE1";

  // Describe-level: IDs to clean up after each test
  let claimId: string | null = null;
  let creatorId: string | null = null;
  let userId: string | null = null;

  beforeAll(() => {
    vi.stubGlobal("fetch", (url: string) => {
      if (url.startsWith(verificationUrl)) {
        return Promise.resolve({
          ok: true,
          text: () =>
            Promise.resolve(`<html><body>${verificationCode}</body></html>`),
        } as Response);
      }
      return Promise.resolve({ ok: false } as Response);
    });
  });

  afterAll(() => {
    vi.unstubAllGlobals();
  });

  afterEach(async () => {
    if (claimId)
      await db.delete(creatorClaims).where(eq(creatorClaims.id, claimId));
    if (creatorId) await db.delete(creators).where(eq(creators.id, creatorId));
    if (userId) await db.delete(users).where(eq(users.id, userId));
    claimId = null;
    creatorId = null;
    userId = null;
  });

  it("auto-approves when website domain of claimee matches email domain of claimant", async () => {
    // 1. Insert user (email test@example.com), , claim (pending, verificationUrl, verificationCode).
    const [user] = await db
      .insert(users)
      .values({ email: "test@example.com" })
      .returning();
    userId = user.id; // so afterEach can delete
    // 1b. Insert creator
    const [creator] = await db
      .insert(creators)
      .values({
        slug: "test-creator-" + nanoid(8),
        createdByUserId: userId,
        type: "artist",
        displayName: "Test Creator",
        status: "stub",
        // ownerUserId: null, website: null (default)
      })
      .returning();
    creatorId = creator.id;
    // 1c. Insert claim
    const verificationToken = nanoid(32);
    const codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow

    const [claim] = await db
      .insert(creatorClaims)
      .values({
        userId: user.id,
        creatorId: creator.id,
        verificationUrl,
        verificationCode,
        verificationToken,
        verificationMethod: "website",
        codeExpiresAt,
        status: "pending",
      })
      .returning();
    claimId = claim.id; // so afterEach can delete
    // 2. verifyClaim(claim)
    const result = await verifyClaim(claim);
    // 3. Expect return { verified: true, requiresApproval: false }
    expect(result).toEqual({
      verified: true,
      requiresApproval: false,
      error: null,
    });
    const [updatedClaim] = await db
      .select()
      .from(creatorClaims)
      .where(eq(creatorClaims.id, claim.id));
    const [updatedCreator] = await db
      .select()
      .from(creators)
      .where(eq(creators.id, creator.id));
    // 4. Assert claim status "approved", creator.ownerUserId set, creator.website set
    expect(updatedClaim?.status).toBe("approved");
    expect(updatedCreator?.ownerUserId).toBe(userId);
    expect(updatedCreator?.website).toBe(verificationUrl);
  });

  it("sets pending_admin_review when email domain differs from website domain", async () => {
    const [user] = await db
      .insert(users)
      .values({ email: "test@gmail.com" })
      .returning();
    userId = user.id;

    const [creator] = await db
      .insert(creators)
      .values({
        slug: "test-creator-" + nanoid(8),
        createdByUserId: userId,
        type: "artist",
        displayName: "Test Creator Different Domain",
        status: "stub",
      })
      .returning();
    creatorId = creator.id;

    const verificationToken = nanoid(32);
    const codeExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const [claim] = await db
      .insert(creatorClaims)
      .values({
        userId: user.id,
        creatorId: creator.id,
        verificationUrl,
        verificationCode,
        verificationToken,
        verificationMethod: "website",
        codeExpiresAt,
        status: "pending",
      })
      .returning();
    claimId = claim.id;

    const result = await verifyClaim(claim);

    expect(result).toEqual({
      verified: true,
      error: null,
      requiresApproval: true,
    });
    const [updatedClaim] = await db
      .select()
      .from(creatorClaims)
      .where(eq(creatorClaims.id, claim.id));
    expect(updatedClaim?.status).toBe("pending_admin_review");
  });
  it("rejects and sets claim to rejected when verification code is expired", async () => {
    const [user] = await db
      .insert(users)
      .values({ email: "test@example.com" })
      .returning();
    userId = user.id;

    const [creator] = await db
      .insert(creators)
      .values({
        slug: "test-creator-" + nanoid(8),
        createdByUserId: userId,
        type: "artist",
        displayName: "Test Creator",
        status: "stub",
      })
      .returning();
    creatorId = creator.id;

    const codeExpiresAt = new Date(0); // past
    const [claim] = await db
      .insert(creatorClaims)
      .values({
        userId: user.id,
        creatorId: creator.id,
        verificationUrl,
        verificationCode,
        verificationToken: nanoid(32),
        verificationMethod: "website",
        codeExpiresAt,
        status: "pending",
      })
      .returning();
    claimId = claim.id;

    const result = await verifyClaim(claim);

    expect(result).toEqual({
      verified: false,
      error: "Verification code has expired. Please request a new one.",
      requiresApproval: false,
    });
    const [updatedClaim] = await db
      .select()
      .from(creatorClaims)
      .where(eq(creatorClaims.id, claim.id));
    expect(updatedClaim?.status).toBe("rejected");
  });

  it("returns invalid verification method when method is not website or URL missing", async () => {
    const [user] = await db
      .insert(users)
      .values({ email: "test@example.com" })
      .returning();
    userId = user.id;

    const [creator] = await db
      .insert(creators)
      .values({
        slug: "test-creator-" + nanoid(8),
        createdByUserId: userId,
        type: "artist",
        displayName: "Test Creator",
        status: "stub",
      })
      .returning();
    creatorId = creator.id;

    const [claim] = await db
      .insert(creatorClaims)
      .values({
        userId: user.id,
        creatorId: creator.id,
        verificationUrl: null,
        verificationCode: "CODE123",
        verificationToken: nanoid(32),
        verificationMethod: "website",
        codeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "pending",
      })
      .returning();
    claimId = claim.id;

    const result = await verifyClaim(claim);

    expect(result).toEqual({
      verified: false,
      error: "Invalid verification method",
      requiresApproval: false,
    });
  });

  it("returns verified false when website does not contain the verification code", async () => {
    const [user] = await db
      .insert(users)
      .values({ email: "test@example.com" })
      .returning();
    userId = user.id;

    const [creator] = await db
      .insert(creators)
      .values({
        slug: "test-creator-" + nanoid(8),
        createdByUserId: userId,
        type: "artist",
        displayName: "Test Creator",
        status: "stub",
      })
      .returning();
    creatorId = creator.id;

    const [claim] = await db
      .insert(creatorClaims)
      .values({
        userId: user.id,
        creatorId: creator.id,
        verificationUrl,
        verificationCode,
        verificationToken: nanoid(32),
        verificationMethod: "website",
        codeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "pending",
      })
      .returning();
    claimId = claim.id;

    const originalFetch = globalThis.fetch;
    vi.stubGlobal("fetch", () =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve("<html><body>wrong code</body></html>"),
      } as Response),
    );
    const result = await verifyClaim(claim);
    vi.stubGlobal("fetch", originalFetch);

    expect(result.verified).toBe(false);
    expect(result.error).toBeDefined();
    const [updatedClaim] = await db
      .select()
      .from(creatorClaims)
      .where(eq(creatorClaims.id, claim.id));
    expect(updatedClaim?.status).toBe("pending");
  });

  it("auto-approves when creator already has website set (existing creator flow)", async () => {
    const [user] = await db
      .insert(users)
      .values({ email: "test@gmail.com" })
      .returning();
    userId = user.id;

    const [creator] = await db
      .insert(creators)
      .values({
        slug: "test-creator-" + nanoid(8),
        createdByUserId: userId,
        type: "artist",
        displayName: "Test Creator",
        status: "stub",
        website: verificationUrl,
      })
      .returning();
    creatorId = creator.id;

    const [claim] = await db
      .insert(creatorClaims)
      .values({
        userId: user.id,
        creatorId: creator.id,
        verificationUrl,
        verificationCode,
        verificationToken: nanoid(32),
        verificationMethod: "website",
        codeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "pending",
      })
      .returning();
    claimId = claim.id;

    const result = await verifyClaim(claim);

    expect(result).toEqual({
      verified: true,
      error: null,
      requiresApproval: false,
    });
    const [updatedClaim] = await db
      .select()
      .from(creatorClaims)
      .where(eq(creatorClaims.id, claim.id));
    const [updatedCreator] = await db
      .select()
      .from(creators)
      .where(eq(creators.id, creator.id));
    expect(updatedClaim?.status).toBe("approved");
    expect(updatedCreator?.ownerUserId).toBe(userId);
    expect(updatedCreator?.website).toBe(verificationUrl);
  });

  it("returns user not found when claim userId has no matching user", async () => {
    const [user] = await db
      .insert(users)
      .values({ email: "creator-owner@example.com" })
      .returning();
    userId = user.id;

    const [creator] = await db
      .insert(creators)
      .values({
        slug: "test-creator-" + nanoid(8),
        createdByUserId: userId,
        type: "artist",
        displayName: "Test Creator",
        status: "stub",
      })
      .returning();
    creatorId = creator.id;

    const fakeUserId = crypto.randomUUID();
    const [claim] = await db
      .insert(creatorClaims)
      .values({
        userId: fakeUserId,
        creatorId: creator.id,
        verificationUrl,
        verificationCode,
        verificationToken: nanoid(32),
        verificationMethod: "website",
        codeExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: "pending",
      })
      .returning();
    claimId = claim.id;

    const result = await verifyClaim(claim);

    expect(result).toEqual({
      verified: false,
      error: "User not found",
      requiresApproval: false,
    });
    userId = null; // nothing to delete for fake user
  });
});
