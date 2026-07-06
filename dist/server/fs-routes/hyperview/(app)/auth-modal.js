import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import { getBaseUrl } from "../../../lib/hyperview.js";
import { hyperview } from "../../../lib/hxml.js";
import AuthModal from "../../../features/hyperview/components/AuthModal.js";
const GET = createRoute(async (c) => {
  const raw = c.req.query("action") ?? "to continue";
  const actionPhrase = raw.trim().slice(0, 200);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (user) {
    return c.redirect(`${baseUrl}/hyperview/featured`);
  }
  return hv(/* @__PURE__ */ jsx(AuthModal, { actionPhrase, baseUrl }));
});
export {
  GET
};
