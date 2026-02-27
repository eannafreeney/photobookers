/**
 * Reset an user's password via Supabase Admin API.
 * Usage: npx tsx scripts/resetAdminPassword.ts <email> <new-password>
 *
 * Requires .env (or .env.scripts) with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.
 * The user is looked up by email from the public.users table.
 */
import "./env";
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { users } from "../src/db/schema";
import { supabaseAdmin } from "../src/lib/supabase";

async function main() {
  const email = process.argv[2];
  const newPassword = process.argv[3];

  if (!email || !newPassword) {
    console.error(
      "Usage: npx tsx scripts/resetAdminPassword.ts <email> <new-password>",
    );
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const [user] = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) {
    console.error(`No user found with email: ${email}`);
    process.exit(1);
  }

  const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) {
    console.error("Failed to update password:", error.message);
    process.exit(1);
  }

  console.log(`Password updated successfully for ${user.email}`);
}

main();
