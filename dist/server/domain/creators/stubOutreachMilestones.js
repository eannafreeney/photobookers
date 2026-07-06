const STUB_VIEW_MILESTONE_THRESHOLDS = [50, 100, 150];
const STUB_VIEW_MILESTONE_KINDS = [
  "views_50",
  "views_100",
  "views_150"
];
function stubViewMilestoneThreshold(kind) {
  switch (kind) {
    case "views_50":
      return 50;
    case "views_100":
      return 100;
    case "views_150":
      return 150;
  }
}
function pickNextStubViewMilestone(sent, allTimeViewCount) {
  for (const threshold of STUB_VIEW_MILESTONE_THRESHOLDS) {
    const kind = `views_${threshold}`;
    if (allTimeViewCount >= threshold && !sent.has(kind)) {
      return kind;
    }
  }
  return null;
}
function allStubViewMilestonesSent(sent) {
  return STUB_VIEW_MILESTONE_KINDS.every((kind) => sent.has(kind));
}
function hasSentAnyStubViewMilestone(sent) {
  return STUB_VIEW_MILESTONE_KINDS.some((kind) => sent.has(kind));
}
export {
  STUB_VIEW_MILESTONE_KINDS,
  STUB_VIEW_MILESTONE_THRESHOLDS,
  allStubViewMilestonesSent,
  hasSentAnyStubViewMilestone,
  pickNextStubViewMilestone,
  stubViewMilestoneThreshold
};
