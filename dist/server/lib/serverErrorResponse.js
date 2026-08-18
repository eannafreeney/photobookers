import { jsx } from "hono/jsx/jsx-runtime";
import ErrorScreen from "../features/hyperview/components/ErrorScreen.js";
import { getIsHyperview } from "../features/hyperview/lib.js";
import { getBaseUrl } from "./hyperview.js";
import { hyperview } from "./hxml.js";
import ServerErrorPage from "../pages/ServerErrorPage.js";
import { recordAndNotifyAdminServerError } from "../domain/server-errors/notifyAdminServerError.js";
import { getUser } from "../utils.js";
import { isClientAbortError } from "./isClientAbortError.js";
const MAINTENANCE_MESSAGE = "We're currently under maintenance. Please try again shortly.";
function wantsJsonResponse(c) {
  const path = c.req.path;
  if (path.startsWith("/api/") || path.startsWith("/jobs/")) return true;
  const accept = c.req.header("accept") ?? "";
  return accept.includes("application/json") && !accept.includes("text/html") && !accept.includes("application/vnd.hyperview");
}
function errorMessage(err) {
  if (err instanceof Error) return err.message;
  return String(err);
}
async function handleServerError(c, err) {
  if (isClientAbortError(err)) {
    console.warn("Client aborted request:", c.req.method, c.req.path);
    return c.body(null, 204);
  }
  console.error("Unhandled server error:", err);
  void recordAndNotifyAdminServerError({
    path: c.req.path,
    method: c.req.method,
    message: errorMessage(err)
  }).catch((notifyError) => {
    console.error("Failed to notify admin of server error:", notifyError);
  });
  try {
    if (getIsHyperview(c)) {
      const user2 = await getUser(c) ?? void 0;
      const baseUrl = getBaseUrl(c);
      return hyperview(c)(
        /* @__PURE__ */ jsx(
          ErrorScreen,
          {
            user: user2,
            baseUrl,
            message: MAINTENANCE_MESSAGE
          }
        ),
        500
      );
    }
    if (wantsJsonResponse(c)) {
      return c.json({ error: "Service temporarily unavailable" }, 500);
    }
    const user = await getUser(c) ?? null;
    return c.html(
      /* @__PURE__ */ jsx(ServerErrorPage, { currentPath: c.req.path, user }),
      500
    );
  } catch (renderError) {
    console.error("Failed to render server error response:", renderError);
    return c.text("Internal Server Error", 500);
  }
}
export {
  handleServerError
};
