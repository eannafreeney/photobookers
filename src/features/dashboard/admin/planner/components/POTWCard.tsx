import { PublisherOfTheWeekWithCreator } from "../services";
import { toWeekString } from "../../../../../lib/utils";
import ScheduleButton from "./ScheduleButton";
import DeleteButton from "./DeleteButton";
import CreatorEmailBadge from "./CreatorEmailBadge";
import SpotlightEmailStatusBadges from "./SpotlightEmailStatusBadges";
import { CreatorInterview, PublisherOfTheWeek } from "../../../../../db/schema";

type PublisherOfTheWeekProps = {
  weekStart: Date;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
  interview: CreatorInterview | null;
};

const PublisherOfTheWeek = ({
  weekStart,
  publisherOfTheWeek,
  interview,
}: PublisherOfTheWeekProps) => {
  const weekKey = toWeekString(weekStart);
  const publisher = publisherOfTheWeek?.creator ?? null;

  return (
    <div class="mt-3 pt-3 border-t border-outline">
      <p class="text-xs font-medium text-on-surface mb-2">
        Publisher of the week
      </p>
      {publisher ? (
        <POTWCardContent
          weekKey={weekKey}
          publisher={publisher}
          publisherOfTheWeek={publisherOfTheWeek}
          interview={interview}
        />
      ) : (
        <ScheduleButton
          href={`/dashboard/admin/planner/publisher-of-the-week/${weekKey}/create`}
          text="Schedule publisher of the week"
        />
      )}
    </div>
  );
};

export default PublisherOfTheWeek;

type POTWCardContentProps = {
  weekKey: string;
  publisher: {
    id: string;
    slug: string;
    displayName: string;
    email: string | null;
    status: "stub" | "verified" | "suspended" | "deleted" | null;
    coverUrl: string | null;
  };
  publisherOfTheWeek: PublisherOfTheWeek | null;
  interview: CreatorInterview | null;
};

const POTWCardContent = ({
  weekKey,
  publisher,
  publisherOfTheWeek,
  interview,
}: POTWCardContentProps) => {
  if (!publisherOfTheWeek) return <></>;
  return (
    <>
      <div class="flex items-start justify-between gap-3">
        {publisher.coverUrl && (
          <img
            src={publisher.coverUrl}
            alt={publisher.displayName}
            class="h-16 w-16 rounded object-cover"
          />
        )}
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <p class="text-sm font-semibold text-on-surface-strong">
              {publisher.displayName}
            </p>
            <CreatorEmailBadge
              name={publisher.displayName}
              creatorId={publisher.id}
              email={publisher.email}
            />
          </div>
        </div>
        <DeleteButton
          action={`/dashboard/admin/planner/publisher-of-the-week/${weekKey}`}
        />
      </div>
      <div class="mt-2 border-t border-outline pt-2 flex flex-col gap-2">
        <SpotlightEmailStatusBadges
          spotlight="publisher"
          row={publisherOfTheWeek}
          creatorId={publisher.id}
          email={publisher.email}
        />
        {interview && (
          <p class="text-xs text-on-surface">
            Interview status: {interview.status}
          </p>
        )}
      </div>
    </>
  );
};
