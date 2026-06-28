import type { StubOutreachEmailKind } from "../../db/schema";
import type { StubViewMilestoneKind } from "../../domain/creators/stubOutreachMilestones";
import type { StubOutreachStats } from "../../domain/creators/stubOutreachStats";

export type StubOutreachSkipReason =
  | "opted_out"
  | "no_email"
  | "welcome_pending"
  | "all_milestones_sent"
  | "welcome_grace_period"
  | "recent_outreach"
  | "recent_spotlight_email"
  | "no_milestone"
  | "view_threshold_not_met";

export type StubOutreachItemOutcome =
  | { status: "sent"; kind: StubOutreachEmailKind; to: string }
  | { status: "skipped"; reason: StubOutreachSkipReason }
  | { status: "failed"; reason: string }
  | { status: "dry_run"; kind: StubOutreachEmailKind; to: string };

export type StubOutreachCronOptions = {
  dryRun?: boolean;
  to?: string;
  creatorId?: string;
  date?: Date;
};

export type StubOutreachCronResult = {
  action: "sent" | "dry_run";
  sent: number;
  skipped: number;
  failed: number;
  items: Array<{ creatorId: string; outcome: StubOutreachItemOutcome }>;
};

export type StubViewMilestoneEmailParams = {
  displayName: string;
  milestone: StubViewMilestoneKind;
  allTimeViews: number;
  stats: StubOutreachStats;
  profileUrl: string;
  claimUrl: string;
};
