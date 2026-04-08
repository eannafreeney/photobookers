import { ArtistOfTheWeekWithCreator } from "../services";
import { toWeekString } from "../../../../../lib/utils";
import ScheduleButton from "./ScheduleButton";
import DeleteButton from "./DeleteButton";
import SendAOTWCreatorEmailButton from "./SendAOTWCreatorEmailButton";

type ArtistOfTheWeekProps = {
  weekStart: Date;
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
};

const AOTWCard = ({ weekStart, artistOfTheWeek }: ArtistOfTheWeekProps) => {
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
    status: "stub" | "verified" | "suspended" | "deleted" | null;
    coverUrl: string | null;
  };
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
};

const AOTWCardContent = ({
  weekKey,
  artist,
  artistOfTheWeek,
}: AOTWCardContentProps) => {
  if (!artistOfTheWeek) return <></>;
  return (
    <>
      <div class="flex gap-3">
        {artist.coverUrl && (
          <img
            src={artist.coverUrl}
            alt={artist.displayName}
            class="h-16 w-16 rounded object-cover"
          />
        )}
        <div class="min-w-0 flex-1 flex flex-col gap-2">
          <p class="text-sm font-semibold text-on-surface-strong">
            {artist.displayName}
          </p>
          <SendAOTWCreatorEmailButton
            artistOfTheWeek={artistOfTheWeek}
            creatorId={artist.id}
          />
        </div>
        <DeleteButton
          action={`/dashboard/admin/planner/artist-of-the-week/${weekKey}`}
        />
      </div>
    </>
  );
};
