import Pill from "../../../../../components/app/Pill";
import Button from "../../../../../components/app/Button";
import FormPost from "../../../../../components/forms/FormPost";
import { Creator } from "../../../../../db/schema";
import {
  allStubViewMilestonesSent,
  pickNextStubViewMilestone,
  stubViewMilestoneThreshold,
  STUB_VIEW_MILESTONE_KINDS,
} from "../../../../../domain/creators/stubOutreachMilestones";
import { getCreatorBookViewTotal } from "../../../../book-views/services";
import { creatorHasPublishedBook } from "../../../../../domain/creators/books";
import { eq } from "drizzle-orm";
import { db } from "../../../../../db/client";
import { creatorStubOutreachEmails } from "../../../../../db/schema";

type Props = {
  creator: Creator;
};

const StubOutreachStatus = async ({ creator }: Props) => {
  const id = `stub-outreach-status-${creator.id}`;

  if (creator.status !== "stub") return <></>;

  if (creator.stubOutreachOptOutAt) {
    return (
      <div id={id} class="flex flex-wrap items-center gap-2">
        <Pill variant="danger">Outreach opted out</Pill>
        <StubOutreachOptOutToggle creator={creator} optedOut targetId={id} />
      </div>
    );
  }

  const rows = await db.query.creatorStubOutreachEmails.findMany({
    where: eq(creatorStubOutreachEmails.creatorId, creator.id),
    columns: { kind: true },
  });
  const sent = new Set(rows.map((row) => row.kind));

  if (!creator.welcomeEmailSent) {
    const hasPublishedBook = await creatorHasPublishedBook(creator);
    return (
      <div id={id} class="flex flex-wrap items-center gap-2">
        {hasPublishedBook ? (
          <Pill variant="warning">Welcome pending (cron)</Pill>
        ) : (
          <Pill variant="default">No published book yet</Pill>
        )}
        <StubOutreachOptOutToggle creator={creator} optedOut={false} targetId={id} />
      </div>
    );
  }

  const viewCount = await getCreatorBookViewTotal(creator.id, creator.type);
  const nextMilestone = pickNextStubViewMilestone(sent, viewCount);

  if (allStubViewMilestonesSent(sent)) {
    return (
      <div id={id} class="flex flex-wrap items-center gap-2">
        <Pill variant="success">All activity emails sent</Pill>
        <StubOutreachOptOutToggle creator={creator} optedOut={false} targetId={id} />
      </div>
    );
  }

  const sentLabels = STUB_VIEW_MILESTONE_KINDS.filter((k) => sent.has(k)).map(
    (k) => `${stubViewMilestoneThreshold(k)} ✓`,
  );

  const statusLabel = nextMilestone
    ? `Next: ${stubViewMilestoneThreshold(nextMilestone)} views (${viewCount} now)`
    : `Waiting for ${stubViewMilestoneThreshold("views_50")} views (${viewCount} now)`;

  return (
    <div id={id} class="flex flex-col gap-2">
      <div class="flex flex-wrap items-center gap-2">
        <Pill variant="info">
          {[sentLabels.length > 0 ? `${sentLabels.join(" · ")} · ` : "", statusLabel].join("")}
        </Pill>
        <StubOutreachOptOutToggle creator={creator} optedOut={false} targetId={id} />
      </div>
    </div>
  );
};

const StubOutreachOptOutToggle = ({
  creator,
  optedOut,
  targetId,
}: {
  creator: Creator;
  optedOut: boolean;
  targetId: string;
}) => (
  <FormPost
    action={`/dashboard/admin/creators/${creator.id}/toggle-stub-outreach-opt-out`}
    x-target={targetId}
  >
    <Button variant="outline" color="inverse" type="submit">
      {optedOut ? "Re-enable outreach" : "Opt out of outreach"}
    </Button>
  </FormPost>
);

export default StubOutreachStatus;
