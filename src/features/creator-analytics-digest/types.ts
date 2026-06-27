import type { CreatorMilestoneKind } from "./milestones";
import type { CreatorType } from "../../db/schema";

export type EligibleCreator = {
  id: string;
  slug: string;
  displayName: string;
  type: CreatorType;
  email: string | null;
  ownerEmail: string | null;
  verifiedAt: Date | null;
  analyticsDigestSentForMonth: string | null;
};

export type DigestSkipReason =
  | "already_sent"
  | "recent_spotlight_email"
  | "recent_milestone_email"
  | "no_email"
  | "not_verified_long_enough";

export type DigestItemOutcome =
  | { status: "sent"; template: "highlight" | "nudge"; to: string }
  | { status: "skipped"; reason: DigestSkipReason }
  | { status: "failed"; reason: string }
  | { status: "dry_run"; template: "highlight" | "nudge"; to: string };

export type MilestoneSkipReason =
  | "no_milestone"
  | "no_email"
  | "not_verified_long_enough";

export type MilestoneItemOutcome =
  | { status: "sent"; milestone: CreatorMilestoneKind; to: string }
  | { status: "skipped"; reason: MilestoneSkipReason }
  | { status: "failed"; reason: string }
  | { status: "dry_run"; milestone: CreatorMilestoneKind; to: string };

export type CreatorEmailCronOptions = {
  dryRun?: boolean;
  force?: boolean;
  to?: string;
  creatorId?: string;
  month?: string;
  date?: Date;
};

export type DigestCronResult = {
  action: "sent" | "skipped" | "dry_run";
  monthKey: string;
  sent: number;
  skipped: number;
  failed: number;
  items: Array<{ creatorId: string; outcome: DigestItemOutcome }>;
};

export type MilestoneCronResult = {
  action: "sent" | "skipped" | "dry_run";
  sent: number;
  skipped: number;
  failed: number;
  items: Array<{ creatorId: string; outcome: MilestoneItemOutcome }>;
};
