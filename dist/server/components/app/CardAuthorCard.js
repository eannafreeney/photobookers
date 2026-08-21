import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { getInitialsAvatar } from "../../lib/avatar.js";
import { truncate } from "../../lib/utils.js";
import Avatar from "./Avatar.js";
import Card from "./Card.js";
import Link from "./Link.js";
import VerificationBadge from "./VerificationBadge.js";
const displayNameFor = (user) => [user.firstName, user.lastName].filter(Boolean).join(" ").trim() || user.email || "Unknown user";
function resolveIdentity(creator, user, maxDisplayNameLength) {
  if (creator) {
    const displayName2 = maxDisplayNameLength != null ? truncate(creator.displayName, maxDisplayNameLength) : creator.displayName ?? "";
    return {
      displayName: displayName2,
      title: creator.displayName,
      avatarSrc: creator.coverUrl ?? "",
      href: `/creators/${creator.slug}`,
      status: creator.status
    };
  }
  if (!user) return null;
  const displayName = displayNameFor(user);
  const isPublicCollector = Boolean(user.shelfSlug && user.shelfPublic);
  return {
    displayName,
    title: displayName,
    avatarSrc: user.profileImageUrl ?? getInitialsAvatar(user.firstName ?? "", user.lastName ?? ""),
    href: isPublicCollector ? `/shelf/${user.shelfSlug}` : null,
    // Same rule as shelf / collectors directory: public shelf ⇒ verified collector.
    status: isPublicCollector ? "verified" : null,
    badgeTitle: isPublicCollector ? "Verified Collector" : void 0
  };
}
const CardAuthorCard = async ({
  banner,
  creator,
  user = null,
  avatarSize = "xs",
  maxDisplayNameLength
}) => {
  const identity = resolveIdentity(creator, user, maxDisplayNameLength);
  if (!identity) return /* @__PURE__ */ jsx(Fragment, {});
  const { displayName, title, avatarSrc, href, status, badgeTitle } = identity;
  const label = banner ?? displayName;
  const avatar = /* @__PURE__ */ jsx(Avatar, { src: avatarSrc, alt: displayName, size: avatarSize });
  const name = /* @__PURE__ */ jsx(Card.SubTitle, { title: displayName, children: label });
  return /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 items-center gap-2", children: [
    href ? /* @__PURE__ */ jsx(Link, { href, className: "shrink-0", children: avatar }) : /* @__PURE__ */ jsx("div", { class: "shrink-0", children: avatar }),
    /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 items-center gap-1", children: [
      href ? /* @__PURE__ */ jsx(Link, { href, className: "min-w-0 truncate", title, children: name }) : /* @__PURE__ */ jsx("div", { class: "min-w-0 truncate", title, children: name }),
      status != null ? /* @__PURE__ */ jsx("div", { class: "shrink-0", children: /* @__PURE__ */ jsx(
        VerificationBadge,
        {
          creatorStatus: status,
          size: "xs",
          title: badgeTitle
        }
      ) }) : null
    ] })
  ] });
};
var CardAuthorCard_default = CardAuthorCard;
export {
  CardAuthorCard_default as default
};
