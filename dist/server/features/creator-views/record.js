import { getCookie, setCookie } from "hono/cookie";
import { getSharedCookieOptions } from "../../lib/authCookies.js";
import { getUser } from "../../utils.js";
import {
  CREATOR_REFERRAL_PARAM,
  parseCreatorReferral
} from "../../lib/embedBadge.js";
import { recordCreatorView } from "./services.js";
function creatorViewCookieName(creatorSlug) {
  return `pb_cv_${creatorSlug}`;
}
async function maybeRecordCreatorView(c, creator, source) {
  const cookieName = creatorViewCookieName(creator.slug);
  if (getCookie(c, cookieName)) return;
  const user = await getUser(c);
  const referer = c.req.header("referer");
  const ref = parseCreatorReferral(c.req.query(CREATOR_REFERRAL_PARAM));
  void recordCreatorView({
    creatorId: creator.id,
    userId: user?.id ?? null,
    source,
    referer,
    ref
  }).catch((error) => {
    console.error("Failed to record creator view", error);
  });
  setCookie(c, cookieName, "1", {
    ...getSharedCookieOptions(c),
    httpOnly: true,
    sameSite: "Lax"
  });
}
export {
  creatorViewCookieName,
  maybeRecordCreatorView
};
