import { createRoute } from "hono-fsr";
import type { Context } from "hono";
import { getUser } from "../../../utils";
import { getBaseUrl } from "../../../lib/hyperview";
import { hyperview } from "../../../lib/hxml";
import AuthModal from "../../../features/hyperview/components/AuthModal";

/** Full `<doc>` for Hyperview `action="new"` (e.g. follow when logged out). */
export const GET = createRoute(async (c: Context) => {
  const raw = c.req.query("action") ?? "to continue";
  const actionPhrase = raw.trim().slice(0, 200);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  if (user) {
    return c.redirect(`${baseUrl}/hyperview/featured`);
  }

  return hv(<AuthModal actionPhrase={actionPhrase} baseUrl={baseUrl} />);
});
