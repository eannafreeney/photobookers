import { PublisherOfTheWeekWithCreator } from "../services";
import { toWeekString } from "../../../../../lib/utils";
import ScheduleButton from "./ScheduleButton";
import DeleteButton from "./DeleteButton";
import SendPOTWCreatorEmailButton from "./SendPOTWCreatorEmailButton";
import { PublisherOfTheWeek } from "../../../../../db/schema";

type PublisherOfTheWeekProps = {
  weekStart: Date;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const PublisherOfTheWeek = ({
  weekStart,
  publisherOfTheWeek,
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
    status: "stub" | "verified" | "suspended" | "deleted" | null;
    coverUrl: string | null;
  };
  publisherOfTheWeek: PublisherOfTheWeek | null;
};

const POTWCardContent = ({
  weekKey,
  publisher,
  publisherOfTheWeek,
}: POTWCardContentProps) => {
  if (!publisherOfTheWeek) return <></>;
  return (
    <>
      <div class="flex gap-3">
        {publisher.coverUrl && (
          <img
            src={publisher.coverUrl}
            alt={publisher.displayName}
            class="h-16 w-16 rounded object-cover"
          />
        )}
        <div class="min-w-0 flex-1 flex flex-col gap-2">
          <p class="text-sm font-semibold text-on-surface-strong">
            {publisher.displayName}
          </p>
          <SendPOTWCreatorEmailButton
            publisherOfTheWeek={publisherOfTheWeek}
            creatorId={publisher.id}
          />
        </div>
        <DeleteButton
          action={`/dashboard/admin/planner/publisher-of-the-week/${weekKey}`}
        />
      </div>
    </>
  );
};
