import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "./Link.js";
import Avatar from "./Avatar.js";
import Card from "./Card.js";
import VerifiedCreator from "./VerifiedCreator.js";
import { truncate } from "../../lib/utils.js";
const CardCreatorCard = async ({
  creator,
  avatarSize = "xs",
  maxDisplayNameLength
}) => {
  if (!creator) return /* @__PURE__ */ jsx(Fragment, {});
  const displayName = maxDisplayNameLength != null ? truncate(creator.displayName, maxDisplayNameLength) : creator.displayName ?? "";
  return /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 items-center gap-2", children: [
    /* @__PURE__ */ jsx(Link, { href: `/creators/${creator.slug}`, className: "shrink-0", children: /* @__PURE__ */ jsx(
      Avatar,
      {
        src: creator.coverUrl ?? "",
        alt: displayName,
        size: avatarSize
      }
    ) }),
    /* @__PURE__ */ jsxs("div", { class: "flex min-w-0 items-center gap-1", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `/creators/${creator.slug}`,
          className: "min-w-0 truncate",
          title: creator.displayName,
          children: /* @__PURE__ */ jsx(Card.SubTitle, { title: displayName, children: displayName })
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "shrink-0", children: /* @__PURE__ */ jsx(VerifiedCreator, { creatorStatus: creator.status, size: "xs" }) })
    ] })
  ] });
};
var CardCreatorCard_default = CardCreatorCard;
export {
  CardCreatorCard_default as default
};
