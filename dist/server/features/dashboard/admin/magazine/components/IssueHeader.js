import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import Link from "../../../../../components/app/Link.js";
import StatusPill from "../../components/StatusPill.js";
const IssueHeader = ({ issue }) => {
  return /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2", children: [
    /* @__PURE__ */ jsx(
      Link,
      {
        href: "/dashboard/admin/magazine",
        className: "text-xs font-medium text-on-surface hover:text-accent",
        children: "\u2190 All issues"
      }
    ),
    /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-3", children: [
      /* @__PURE__ */ jsx(StatusPill, { status: issue.status }),
      issue.issueNumber ? /* @__PURE__ */ jsxs("span", { class: "text-sm font-semibold text-on-surface", children: [
        "Issue ",
        issue.issueNumber
      ] }) : null,
      /* @__PURE__ */ jsx(
        Link,
        {
          href: `/dashboard/admin/magazine/${issue.id}/preview`,
          target: "_blank",
          className: "text-xs font-medium text-accent hover:underline",
          children: "Preview \u2192"
        }
      ),
      issue.status === "published" ? /* @__PURE__ */ jsx(
        Link,
        {
          href: `/magazine/${issue.slug}`,
          target: "_blank",
          className: "text-xs font-medium text-accent hover:underline",
          children: "View live \u2192"
        }
      ) : null
    ] }),
    /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl font-medium text-on-surface-strong", children: issue.title }),
    issue.subtitle ? /* @__PURE__ */ jsx("p", { class: "text-on-surface", children: issue.subtitle }) : null,
    issue.theme ? /* @__PURE__ */ jsx("p", { class: "text-sm italic text-on-surface-weak", children: issue.theme }) : null
  ] });
};
var IssueHeader_default = IssueHeader;
export {
  IssueHeader_default as default
};
