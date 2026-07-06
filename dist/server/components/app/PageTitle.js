import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Avatar from "./Avatar.js";
import Button from "./Button.js";
import VerifiedCreator from "./VerifiedCreator.js";
import { canEditCreator } from "../../lib/permissions.js";
const PageTitle = ({ title, creator, user }) => {
  const canEdit = user && creator ? canEditCreator(user, creator) : false;
  return /* @__PURE__ */ jsxs("div", { class: "hidden md:flex items-center gap-4 mb-8 border-b border-outline pb-4", children: [
    creator?.coverUrl && /* @__PURE__ */ jsxs("div", { class: "relative", children: [
      /* @__PURE__ */ jsx(
        Avatar,
        {
          src: creator.coverUrl ?? "",
          alt: creator.displayName ?? "",
          size: "md"
        }
      ),
      /* @__PURE__ */ jsx("div", { class: "absolute -top-2 -right-2", children: /* @__PURE__ */ jsx(
        VerifiedCreator,
        {
          creatorStatus: creator.status ?? "stub",
          size: "sm"
        }
      ) })
    ] }),
    /* @__PURE__ */ jsx("div", { class: "flex flex-col gap-0.5", children: /* @__PURE__ */ jsx("div", { class: "font-display text-3xl md:text-5xl font-medium text-on-surface-strong -mb-1", children: creator?.displayName ?? title }) }),
    canEdit && /* @__PURE__ */ jsx("a", { href: `/dashboard/admin/creators/${creator?.id}`, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "secondary", width: "sm", children: "Edit" }) })
  ] });
};
var PageTitle_default = PageTitle;
export {
  PageTitle_default as default
};
