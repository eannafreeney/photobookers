import { Context } from "hono";
import { createRoute } from "hono-fsr";
import { verifyInstagramCancelToken } from "@/lib/adminActionToken";
import { cancelInstagramPostFromToken } from "@/domain/planner/cron/instagramCancelServices";

/** One-click cancel link from admin preview emails (signed token, no session). */
export const GET = createRoute(async (c: Context) => {
  const token = c.req.query("token")?.trim();
  if (!token) {
    return c.html(cancelResultPage("Missing cancel token.", false), 400);
  }

  const action = verifyInstagramCancelToken(token);
  if (!action) {
    return c.html(cancelResultPage("This cancel link is invalid or expired.", false), 403);
  }

  const [error, result] = await cancelInstagramPostFromToken(action);
  if (error) {
    return c.html(cancelResultPage(error.reason, false), 500);
  }

  const message = result.alreadyCancelled
    ? "This Instagram post was already removed."
    : "The scheduled Instagram post has been removed from Buffer.";
  return c.html(cancelResultPage(message, true));
});

function cancelResultPage(message: string, success: boolean): string {
  const title = success ? "Post removed" : "Could not remove post";
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(title)} — Photobookers</title>
  <style>
    body { font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1rem; color: #1a1a1a; }
    h1 { font-size: 1.25rem; }
    a { color: #2563eb; }
  </style>
</head>
<body>
  <h1>${escapeHtml(title)}</h1>
  <p>${escapeHtml(message)}</p>
  <p><a href="/dashboard/admin/planner">Open planner</a></p>
</body>
</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
