import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import Pill from "../../../../../components/app/Pill.js";
import Button from "../../../../../components/app/Button.js";
import FormPost from "../../../../../components/forms/FormPost.js";
import {
  allStubViewMilestonesSent,
  pickNextStubViewMilestone,
  stubViewMilestoneThreshold,
  STUB_VIEW_MILESTONE_KINDS
} from "../../../../../domain/creators/stubOutreachMilestones.js";
import { getCreatorBookViewTotal } from "../../../../book-views/services.js";
import { eq } from "drizzle-orm";
import { db } from "../../../../../db/client.js";
import { creatorStubOutreachEmails } from "../../../../../db/schema.js";
const StubOutreachStatus = async ({ creator }) => {
  const id = `stub-outreach-status-${creator.id}`;
  if (creator.status !== "stub") return /* @__PURE__ */ jsx(Fragment, {});
  if (creator.stubOutreachOptOutAt) {
    return /* @__PURE__ */ jsxs("div", { id, class: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(Pill, { variant: "danger", children: "Outreach opted out" }),
      /* @__PURE__ */ jsx(StubOutreachOptOutToggle, { creator, optedOut: true, targetId: id })
    ] });
  }
  const rows = await db.query.creatorStubOutreachEmails.findMany({
    where: eq(creatorStubOutreachEmails.creatorId, creator.id),
    columns: { kind: true }
  });
  const sent = new Set(rows.map((row) => row.kind));
  if (!creator.welcomeEmailSent) {
    return /* @__PURE__ */ jsxs("div", { id, class: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(Pill, { variant: "warning", children: "Welcome pending (cron)" }),
      /* @__PURE__ */ jsx(StubOutreachOptOutToggle, { creator, optedOut: false, targetId: id })
    ] });
  }
  const viewCount = await getCreatorBookViewTotal(creator.id, creator.type);
  const nextMilestone = pickNextStubViewMilestone(sent, viewCount);
  if (allStubViewMilestonesSent(sent)) {
    return /* @__PURE__ */ jsxs("div", { id, class: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(Pill, { variant: "success", children: "All activity emails sent" }),
      /* @__PURE__ */ jsx(StubOutreachOptOutToggle, { creator, optedOut: false, targetId: id })
    ] });
  }
  const sentLabels = STUB_VIEW_MILESTONE_KINDS.filter((k) => sent.has(k)).map(
    (k) => `${stubViewMilestoneThreshold(k)} \u2713`
  );
  const statusLabel = nextMilestone ? `Next: ${stubViewMilestoneThreshold(nextMilestone)} views (${viewCount} now)` : `Waiting for ${stubViewMilestoneThreshold("views_50")} views (${viewCount} now)`;
  return /* @__PURE__ */ jsx("div", { id, class: "flex flex-col gap-2", children: /* @__PURE__ */ jsxs("div", { class: "flex flex-wrap items-center gap-2", children: [
    /* @__PURE__ */ jsx(Pill, { variant: "info", children: [sentLabels.length > 0 ? `${sentLabels.join(" \xB7 ")} \xB7 ` : "", statusLabel].join("") }),
    /* @__PURE__ */ jsx(StubOutreachOptOutToggle, { creator, optedOut: false, targetId: id })
  ] }) });
};
const StubOutreachOptOutToggle = ({
  creator,
  optedOut,
  targetId
}) => /* @__PURE__ */ jsx(
  FormPost,
  {
    action: `/dashboard/admin/creators/${creator.id}/toggle-stub-outreach-opt-out`,
    "x-target": targetId,
    children: /* @__PURE__ */ jsx(Button, { variant: "outline", color: "inverse", type: "submit", children: optedOut ? "Re-enable outreach" : "Opt out of outreach" })
  }
);
var StubOutreachStatus_default = StubOutreachStatus;
export {
  StubOutreachStatus_default as default
};
