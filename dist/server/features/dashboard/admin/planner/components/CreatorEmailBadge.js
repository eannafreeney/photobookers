import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
const CreatorEmailBadge = ({ creatorId, email, name }) => {
  const hasEmail = Boolean(email?.trim());
  const classes = hasEmail ? "border-success bg-success/10 text-success hover:bg-success/15" : "border-danger bg-danger/10 text-danger hover:bg-danger/15";
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(
      "a",
      {
        id: `creator-email-${creatorId}`,
        href: `/dashboard/admin/planner/creators/${creatorId}/edit-email`,
        "x-target": "modal-root",
        title: hasEmail ? `Edit ${email}` : "Add email",
        class: `inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors ${classes}`,
        children: [
          /* @__PURE__ */ jsx("span", { children: "Email" }),
          hasEmail ? checkIcon : crossIcon
        ]
      }
    ),
    !hasEmail && /* @__PURE__ */ jsx(
      "a",
      {
        href: `https://google.com/search?q=${name}+photographer`,
        target: "_blank",
        class: "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition-colors border-outline bg-surface-alt text-on-surface hover:bg-surface",
        children: /* @__PURE__ */ jsx("span", { children: "Search" })
      }
    )
  ] });
};
var CreatorEmailBadge_default = CreatorEmailBadge;
const checkIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-3.5",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx(
      "path",
      {
        "fill-rule": "evenodd",
        d: "M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z",
        "clip-rule": "evenodd"
      }
    )
  }
);
const crossIcon = /* @__PURE__ */ jsx(
  "svg",
  {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 20 20",
    fill: "currentColor",
    class: "size-3.5",
    "aria-hidden": "true",
    children: /* @__PURE__ */ jsx("path", { d: "M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" })
  }
);
export {
  CreatorEmailBadge_default as default
};
