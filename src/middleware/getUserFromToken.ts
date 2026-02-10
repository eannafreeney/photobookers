import { supabaseAdmin } from "../lib/supabase";
import { db } from "../db/client";
import { creators, users } from "../db/schema";
import { eq } from "drizzle-orm";

export async function getUserFromToken(token: string) {
  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) return null;

    // Get full user data from your table
    try {
      const [[dbUser], [creatorProfile]] = await Promise.all([
        db.select().from(users).where(eq(users.id, user.id)),
        db.select().from(creators).where(eq(creators.ownerUserId, user.id)),
      ]);

      if (!dbUser) return null;

      return {
        id: dbUser.id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        creator: creatorProfile || null,
        isAdmin: dbUser.isAdmin ?? false,
      };
    } catch (dbError: any) {
      // Handle database connection errors
      console.error("Database connection error:", dbError);

      // Check if it's a connection/DNS error
      if (
        dbError?.cause?.code === "ENOTFOUND" ||
        dbError?.code === "ENOTFOUND" ||
        dbError?.message?.includes("getaddrinfo") ||
        dbError?.message?.includes("ENOTFOUND")
      ) {
        console.error(
          "Database hostname cannot be resolved. Please check your DATABASE_URL environment variable.",
        );
      }

      // Return null to allow the request to continue (for optional auth)
      // The app can handle the missing user gracefully
      return null;
    }
  } catch (error: any) {
    // Handle Supabase auth errors
    console.error("Auth error:", error);
    return null;
  }
}
