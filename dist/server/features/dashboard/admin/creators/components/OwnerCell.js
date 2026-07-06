import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Button from "../../../../../components/app/Button.js";
import Link from "../../../../../components/app/Link.js";
import { getUserByIdAdmin } from "../../users/services.js";
import RemoveOwnerButton from "./RemoveOwnerButton.js";
const OwnerCell = async ({ ownerUserId, creatorId }) => {
  if (ownerUserId) {
    const [error, user] = await getUserByIdAdmin(ownerUserId);
    if (error || !user) return /* @__PURE__ */ jsx(Fragment, {});
    return /* @__PURE__ */ jsxs("div", { id: `creator-owner-${creatorId}`, class: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `/dashboard/admin/users/${ownerUserId}`,
          title: user?.email ?? "Unassigned",
          className: "inline-block max-w-[180px] truncate",
          children: user?.email ?? "Unassigned"
        }
      ),
      /* @__PURE__ */ jsx(RemoveOwnerButton, { creatorId })
    ] });
  }
  return /* @__PURE__ */ jsx(
    "a",
    {
      id: `creator-owner-${creatorId}`,
      href: `/dashboard/admin/creators/assign-owner/${creatorId}`,
      "x-target": "modal-root",
      children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", children: /* @__PURE__ */ jsx("span", { children: "Assign Owner" }) })
    }
  );
};
var OwnerCell_default = OwnerCell;
export {
  OwnerCell_default as default
};
