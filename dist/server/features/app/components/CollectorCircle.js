import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../components/app/Link.js";
import VerificationBadge from "../../../components/app/VerificationBadge.js";
import {
  collectorDisplayName
} from "../../../domain/collectors/services.js";
import { getInitialsAvatar } from "../../../lib/avatar.js";
import { truncate } from "../../../lib/utils.js";
import { getImageSizeClass } from "../utils.js";
const CollectorCircle = ({
  collector,
  size = 32,
  showType = false
}) => {
  if (!collector.shelfSlug) return /* @__PURE__ */ jsx(Fragment, {});
  const name = collectorDisplayName(collector);
  const avatarUrl = collector.profileImageUrl ?? getInitialsAvatar(collector.firstName ?? "", collector.lastName ?? "");
  return /* @__PURE__ */ jsx("div", { class: "flex flex-col items-center gap-4", children: /* @__PURE__ */ jsxs("a", { href: `/shelf/${collector.shelfSlug}`, children: [
    /* @__PURE__ */ jsxs("div", { class: "relative inline-block", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: avatarUrl,
          alt: name,
          title: name,
          class: `rounded-full object-cover ${getImageSizeClass(size)}`
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "absolute top-0 right-3", children: /* @__PURE__ */ jsx(
        VerificationBadge,
        {
          creatorStatus: "verified",
          size: "sm",
          title: "Verified Collector"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-col items-center gap-1", children: [
      /* @__PURE__ */ jsx(Link, { href: `/shelf/${collector.shelfSlug}`, children: /* @__PURE__ */ jsx("span", { class: "text-sm font-medium", children: truncate(name, 20) }) }),
      showType ? /* @__PURE__ */ jsx("span", { class: "kicker text-on-surface-weak text-xs capitalize", children: "collector" }) : null
    ] })
  ] }) });
};
var CollectorCircle_default = CollectorCircle;
export {
  CollectorCircle_default as default
};
