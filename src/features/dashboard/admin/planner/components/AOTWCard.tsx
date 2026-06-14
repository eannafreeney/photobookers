import { ArtistOfTheWeekWithCreator } from "../services";
import { toWeekString } from "../../../../../lib/utils";
import ScheduleButton from "./ScheduleButton";
import DeleteButton from "./DeleteButton";
import CreatorEmailBadge from "./CreatorEmailBadge";
import SpotlightEmailStatusBadges from "./SpotlightEmailStatusBadges";
import { CreatorInterview } from "../../../../../db/schema";

type ArtistOfTheWeekProps = {
  weekStart: Date;
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  interview: CreatorInterview | null;
};

const AOTWCard = ({
  weekStart,
  artistOfTheWeek,
  interview,
}: ArtistOfTheWeekProps) => {
  const weekKey = toWeekString(weekStart);
  const artist = artistOfTheWeek?.creator ?? null;

  return (
    <div class="mt-3 pt-3 border-t border-outline">
      <p class="text-xs font-medium text-on-surface mb-2">Artist of the week</p>
      {artist ? (
        <AOTWCardContent
          weekKey={weekKey}
          artist={artist}
          artistOfTheWeek={artistOfTheWeek}
          interview={interview}
        />
      ) : (
        <ScheduleButton
          href={`/dashboard/admin/planner/artist-of-the-week/${weekKey}/create`}
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
    email: string | null;
    status: "stub" | "verified" | "suspended" | "deleted" | null;
    coverUrl: string | null;
  };
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  interview: CreatorInterview | null;
};

const AOTWCardContent = ({
  weekKey,
  artist,
  artistOfTheWeek,
  interview,
}: AOTWCardContentProps) => {
  if (!artistOfTheWeek) return <></>;
  return (
    <>
      <div class="flex items-start justify-between gap-3">
        {artist.coverUrl && (
          <img
            src={artist.coverUrl}
            alt={artist.displayName}
            class="h-16 w-16 rounded object-cover"
          />
        )}
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5 flex-wrap">
            <p class="text-sm font-semibold text-on-surface-strong">
              {artist.displayName}
            </p>
            <CreatorEmailBadge
              creatorId={artist.id}
              email={artist.email}
              name={artist.displayName}
            />
          </div>
        </div>
        <DeleteButton
          action={`/dashboard/admin/planner/artist-of-the-week/${weekKey}`}
        />
      </div>
      <div class="mt-2 border-t border-outline pt-2 flex flex-col gap-2">
        <SpotlightEmailStatusBadges
          spotlight="artist"
          row={artistOfTheWeek}
          creatorId={artist.id}
          email={artist.email}
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
