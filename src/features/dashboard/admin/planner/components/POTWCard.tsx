import { PublisherOfTheWeekWithCreator } from "../services";
import { toWeekString } from "../../../../../lib/utils";
import Link from "../../../../../components/app/Link";
import Button from "../../../../../components/app/Button";
import ScheduleButton from "./ScheduleButton";
import DeleteButton from "./DeleteButton";

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
      <p class="text-xs font-medium text-on-surface-weak mb-2">
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
          href={`/dashboard/admin/planner/publisher-of-the-week/create?week=${weekKey}`}
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
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const POTWCardContent = ({
  weekKey,
  publisher,
  publisherOfTheWeek,
}: POTWCardContentProps) => (
  <>
    <div class="flex gap-3">
      {publisher.coverUrl && (
        <img
          src={publisher.coverUrl}
          alt={publisher.displayName}
          class="h-16 w-16 rounded object-cover"
        />
      )}
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-on-surface-strong">
          {publisher.displayName}
        </p>
        {/* {publisherOfTheWeek?.text ? (
          <p class="text-xs text-on-surface-weak line-clamp-2 mt-1">
            {publisherOfTheWeek.text}
          </p>
        ) : (
          <p class="text-sm font-medium text-danger">Text missing</p>
        )} */}
      </div>
    </div>
    <div class="flex items-center gap-2 mt-2">
      <Link href={`/creators/${publisher.slug}`} target="_blank">
        <Button variant="solid" color="primary">
          View
        </Button>
      </Link>
      <a
        href={`/dashboard/admin/planner/publisher-of-the-week/update?week=${weekKey}`}
        x-target="modal-root"
      >
        <Button variant="outline" color="primary">
          Edit
        </Button>
      </a>
      <DeleteButton
        action={`/dashboard/admin/planner/publisher-of-the-week/delete?week=${weekKey}`}
      />
    </div>
  </>
);
