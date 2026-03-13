import { Context } from "hono";
import { supabaseAdmin } from "../../lib/supabase";
import {
  buildFollowerNotificationEmails,
  markFollowerNotificationsSent,
} from "./services";

export async function cronNotifyFollowersNewBooks(c: Context) {
  const secret =
    c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ??
    c.req.query("secret");

  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const { emails, bookIds } = await buildFollowerNotificationEmails();

  if (emails.length === 0) {
    return c.json({ ok: true, sent: 0, books: 0 });
  }

  // Single batched invocation (one Supabase function call for the whole day)
  const { error } = await supabaseAdmin.functions.invoke("send-email-batch", {
    body: { emails },
    headers: { "x-function-secret": process.env.FUNCTION_SECRET ?? "" },
  });
  if (error) {
    console.error("Cron notify-followers: send-email-batch failed", error);
    return c.json({ error: "Failed to send emails" }, 500);
  }

  await markFollowerNotificationsSent(bookIds);
  return c.json({ ok: true, sent: emails.length, books: bookIds.length });
}
