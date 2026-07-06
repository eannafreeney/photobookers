import { supabaseAdmin } from "../lib/supabase.js";
import { db } from "../db/client.js";
import { creators, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
async function getUserFromToken(token) {
  try {
    const {
      data: { user },
      error
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return null;
    try {
      const [[dbUser], [creatorProfile]] = await Promise.all([
        db.select().from(users).where(eq(users.id, user.id)),
        db.select().from(creators).where(eq(creators.ownerUserId, user.id))
      ]);
      if (!dbUser) return null;
      return {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        profileImageUrl: dbUser.profileImageUrl,
        creator: creatorProfile || null,
        isAdmin: dbUser.isAdmin ?? false,
        mustResetPassword: dbUser.mustResetPassword ?? false
      };
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      if (dbError?.cause?.code === "ENOTFOUND" || dbError?.code === "ENOTFOUND" || dbError?.message?.includes("getaddrinfo") || dbError?.message?.includes("ENOTFOUND")) {
        console.error(
          "Database hostname cannot be resolved. Please check your DATABASE_URL environment variable."
        );
      }
      return null;
    }
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
export {
  getUserFromToken
};
