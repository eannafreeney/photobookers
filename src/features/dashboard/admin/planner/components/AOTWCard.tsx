import { ArtistOfTheWeekWithCreator } from "../services";
import { toWeekString } from "../../../../../lib/utils";
import Link from "../../../../../components/app/Link";
import Button from "../../../../../components/app/Button";
import ScheduleButton from "./ScheduleButton";
import DeleteButton from "./DeleteButton";

type ArtistOfTheWeekProps = {
  weekStart: Date;
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
};

const AOTWCard = ({ weekStart, artistOfTheWeek }: ArtistOfTheWeekProps) => {
  const weekKey = toWeekString(weekStart);
  const artist = artistOfTheWeek?.creator ?? null;

  return (
    <div class="mt-3 pt-3 border-t border-outline">
      <p class="text-xs font-medium text-on-surface-weak mb-2">
        Artist of the week
      </p>
      {artist ? (
        <AOTWCardContent
          weekKey={weekKey}
          artist={artist}
          artistOfTheWeek={artistOfTheWeek}
        />
      ) : (
        <ScheduleButton
          href={`/dashboard/admin/planner/artist-of-the-week/create?week=${weekKey}`}
          text="Schedule artist of the week"
        />
      )}
    </div>
  );
};

export default AOTWCard;

type AOTWCardContentProps = {
  weekKey: string;
  artist: {
    id: string;
    slug: string;
    displayName: string;
    status: "stub" | "verified" | "suspended" | "deleted" | null;
    coverUrl: string | null;
  };
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
};

const AOTWCardContent = ({
  weekKey,
  artist,
  artistOfTheWeek,
}: AOTWCardContentProps) => (
  <>
    <div class="flex gap-3">
      {artist.coverUrl && (
        <img
          src={artist.coverUrl}
          alt={artist.displayName}
          class="h-16 w-16 rounded object-cover"
        />
      )}
      <div class="min-w-0 flex-1">
        <p class="text-sm font-semibold text-on-surface-strong">
          {artist.displayName}
        </p>
        {/* {artistOfTheWeek?.text ? (
          <p class="text-xs text-on-surface-weak line-clamp-2 mt-1">
            {artistOfTheWeek.text}
          </p>
        ) : (
          <p class="text-sm font-medium text-danger">Text missing</p>
        )} */}
      </div>
    </div>
    <div class="flex items-center gap-2 mt-2">
      <Link href={`/creators/${artist.slug}`} target="_blank">
        <Button variant="solid" color="primary">
          View
        </Button>
      </Link>
      <a
        href={`/dashboard/admin/planner/artist-of-the-week/update?week=${weekKey}`}
        x-target="modal-root"
      >
        <Button variant="outline" color="primary">
          Edit
        </Button>
      </a>
      <DeleteButton
        action={`/dashboard/admin/planner/artist-of-the-week/delete?week=${weekKey}`}
      />
    </div>
  </>
);
