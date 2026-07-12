import type { Context } from "hono";
import ErrorScreen from "../features/hyperview/components/ErrorScreen";
import { getIsHyperview } from "../features/hyperview/lib";
import { getBaseUrl } from "./hyperview";
import { hyperview } from "./hxml";
import ServerErrorPage from "../pages/ServerErrorPage";
import { recordAndNotifyAdminServerError } from "../domain/server-errors/notifyAdminServerError";
import { getUser } from "../utils";

const MAINTENANCE_MESSAGE =
  "We're currently under maintenance. Please try again shortly.";

function wantsJsonResponse(c: Context) {
  const path = c.req.path;
  if (path.startsWith("/api/") || path.startsWith("/jobs/")) return true;

  const accept = c.req.header("accept") ?? "";
  return (
    accept.includes("application/json") &&
    !accept.includes("text/html") &&
    !accept.includes("application/vnd.hyperview")
  );
}

function errorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  return String(err);
}

export async function handleServerError(c: Context, err: unknown) {
  console.error("Unhandled server error:", err);

  void recordAndNotifyAdminServerError({
    path: c.req.path,
    method: c.req.method,
    message: errorMessage(err),
  }).catch((notifyError) => {
    console.error("Failed to notify admin of server error:", notifyError);
  });

  try {
    if (getIsHyperview(c)) {
      const user = (await getUser(c)) ?? undefined;
      const baseUrl = getBaseUrl(c);
      return hyperview(c)(
        <ErrorScreen
          user={user}
          baseUrl={baseUrl}
          message={MAINTENANCE_MESSAGE}
        />,
        500,
      );
    }

    if (wantsJsonResponse(c)) {
      return c.json({ error: "Service temporarily unavailable" }, 500);
    }

    const user = (await getUser(c)) ?? null;
    return c.html(
      <ServerErrorPage currentPath={c.req.path} user={user} />,
      500,
    );
  } catch (renderError) {
    console.error("Failed to render server error response:", renderError);
    return c.text("Internal Server Error", 500);
  }
}
