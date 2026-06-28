import type { StubOutreachEmailKind } from "../../db/schema";

export const STUB_VIEW_MILESTONE_THRESHOLDS = [50, 100, 150] as const;

export type StubViewMilestoneKind = Extract<
  StubOutreachEmailKind,
  "views_50" | "views_100" | "views_150"
>;

export const STUB_VIEW_MILESTONE_KINDS: StubViewMilestoneKind[] = [
  "views_50",
  "views_100",
  "views_150",
];

export function stubViewMilestoneThreshold(
  kind: StubViewMilestoneKind,
): number {
  switch (kind) {
    case "views_50":
      return 50;
    case "views_100":
      return 100;
    case "views_150":
      return 150;
  }
}

export function pickNextStubViewMilestone(
  sent: Set<string>,
  allTimeViewCount: number,
): StubViewMilestoneKind | null {
  for (const threshold of STUB_VIEW_MILESTONE_THRESHOLDS) {
    const kind = `views_${threshold}` as StubViewMilestoneKind;
    if (allTimeViewCount >= threshold && !sent.has(kind)) {
      return kind;
    }
  }
  return null;
}

export function allStubViewMilestonesSent(sent: Set<string>): boolean {
  return STUB_VIEW_MILESTONE_KINDS.every((kind) => sent.has(kind));
}

export function hasSentAnyStubViewMilestone(sent: Set<string>): boolean {
  return STUB_VIEW_MILESTONE_KINDS.some((kind) => sent.has(kind));
}
