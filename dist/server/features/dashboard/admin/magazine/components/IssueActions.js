import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import PublishMagazineIssueToggle from "./PublishToggle.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import Button from "../../../../../components/app/Button.js";
import FormDelete from "../../../../../components/forms/FormDelete.js";
const IssueActions = ({ issue, action, nextNumber }) => /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-3 border border-on-surface-strong bg-surface-alt p-4", children: [
  /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Actions" }),
  /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center justify-between gap-3", children: [
    issue.status === "draft" ? /* @__PURE__ */ jsx("form", { method: "post", action: `${action}/approve`, children: /* @__PURE__ */ jsx(
      "button",
      {
        type: "submit",
        class: "border border-[#4f7a4a] px-3 py-1.5 text-sm font-semibold text-[#4f7a4a] hover:bg-[#4f7a4a]/10",
        children: "\u2713 Approve"
      }
    ) }) : null,
    /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { class: "text-sm font-medium text-on-surface", children: "Published" }),
      /* @__PURE__ */ jsx(
        PublishMagazineIssueToggle,
        {
          issueId: issue.id,
          isPublished: issue.status === "published",
          redirect: action
        }
      )
    ] }),
    /* @__PURE__ */ jsx(PublishIssueButton, { issue, nextNumber }),
    /* @__PURE__ */ jsx(DeleteIssueButton, { issueId: issue.id })
  ] }),
  issue.status !== "published" ? /* @__PURE__ */ jsx("p", { class: "text-xs text-on-surface-weak", children: "Drafts are hidden from the public site. Approve, then publish with a number to make it live (still behind the magazine feature flag)." }) : null
] });
var IssueActions_default = IssueActions;
const PublishIssueButton = ({ issue, nextNumber }) => {
  const action = `/dashboard/admin/magazine/${issue.id}`;
  return /* @__PURE__ */ jsxs(FormPost, { action: `${action}/number`, className: "flex items-center gap-2", children: [
    /* @__PURE__ */ jsx("label", { class: "text-sm text-on-surface", children: "Issue #" }),
    /* @__PURE__ */ jsx(
      "input",
      {
        type: "number",
        name: "issueNumber",
        min: 1,
        value: String(issue.issueNumber ?? nextNumber),
        class: "w-20 border border-outline bg-surface px-2 py-1.5 text-sm tabular-nums text-on-surface"
      }
    ),
    /* @__PURE__ */ jsx(Button, { variant: "outline", color: "primary", children: "Publish" })
  ] });
};
const DeleteIssueButton = ({ issueId }) => {
  const action = `/dashboard/admin/magazine/${issueId}`;
  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()"
  };
  return /* @__PURE__ */ jsx(FormDelete, { action: `${action}/delete`, ...alpineAttrs, children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "danger", children: "Delete" }) });
};
export {
  IssueActions_default as default
};
