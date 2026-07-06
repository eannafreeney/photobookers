import { createRoute } from "hono-fsr";
import {
  buildCreatorPostNotificationEmails,
  markCreatorPostNotificationsSent
} from "../../../features/jobs/services.js";
import { supabaseAdmin } from "../../../lib/supabase.js";
const POST = createRoute(async (c) => {
  const secret = c.req.header("Authorization")?.replace(/^Bearer\s+/i, "") ?? c.req.query("secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const { emails, postIds } = await buildCreatorPostNotificationEmails();
  if (postIds.length === 0) {
    return c.json({ ok: true, sent: 0, posts: 0 });
  }
  if (emails.length > 0) {
    const { error } = await supabaseAdmin.functions.invoke("send-email-batch", {
      body: { emails },
      headers: { "x-function-secret": process.env.FUNCTION_SECRET ?? "" }
    });
    if (error) {
      console.error("Cron notify-followers-new-posts: send-email-batch failed", error);
      return c.json({ error: "Failed to send emails" }, 500);
    }
  }
  await markCreatorPostNotificationsSent(postIds);
  return c.json({ ok: true, sent: emails.length, posts: postIds.length });
});
export {
  POST
};
