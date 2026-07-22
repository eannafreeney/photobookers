import Card from "../../../../../components/app/Card";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import { toDateString, toWeekString } from "../../../../../lib/utils";
import { CreatorInterview } from "../../../../../db/schema";
import {
  ArtistOfTheWeekWithCreator,
  PublisherOfTheWeekWithCreator,
} from "../services";
import BOTDCard from "./BOTDCard";
import AOTWCard from "./AOTWCard";
import POTWCard from "./POTWCard";
import { formatWeekRange, getWeekDays } from "../utils";
import RandomizeBOTDButton from "./RandomizeBOTDButton";
import Button from "@/components/app/Button";

type Props = {
  weekStart: Date;
  weekNumber: number;
  botdByDate: Map<string, BookOfTheDayWithBook>;
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
  instagramPrepared: boolean;
  interviewByCreatorId: Map<string, CreatorInterview> | null;
};

const WeekCard = ({
  weekStart,
  weekNumber,
  botdByDate,
  artistOfTheWeek,
  publisherOfTheWeek,
  instagramPrepared,
  interviewByCreatorId,
}: Props) => {
  const days = getWeekDays(weekStart);

  return (
    <Card className="flex flex-col">
      <WeekCardHeader
        weekStart={weekStart}
        weekNumber={weekNumber}
        instagramPrepared={instagramPrepared}
        botdByDate={botdByDate}
      />
      <Card.Body gap="2">
        {days.map((day) => {
          const key = toDateString(day);
          const botd = botdByDate.get(key) ?? null;
          return <BOTDCard key={key} date={day} bookOfTheDay={botd} />;
        })}
        <AOTWCard
          weekStart={weekStart}
          artistOfTheWeek={artistOfTheWeek}
          interview={
            artistOfTheWeek
              ? (interviewByCreatorId?.get(artistOfTheWeek.creatorId) ?? null)
              : null
          }
        />
        <POTWCard
          weekStart={weekStart}
          publisherOfTheWeek={publisherOfTheWeek}
          interview={
            publisherOfTheWeek
              ? (interviewByCreatorId?.get(publisherOfTheWeek.creatorId) ??
                null)
              : null
          }
        />
      </Card.Body>
    </Card>
  );
};

export default WeekCard;

type WeekCardHeaderProps = {
  weekStart: Date;
  weekNumber: number;
  instagramPrepared: boolean;
  botdByDate: Map<string, BookOfTheDayWithBook>;
};

const instagramButtonClasses = (prepared: boolean): string => {
  const base = "rounded border px-2 py-1 text-xs font-medium opacity-80";
  if (prepared) {
    return `${base} border-success bg-success/15 text-on-surface-strong hover:opacity-90`;
  }
  return `${base} border-outline bg-surface-alt text-on-surface hover:bg-surface`;
};

const WeekCardHeader = ({
  weekStart,
  weekNumber,
  instagramPrepared,
  botdByDate,
}: WeekCardHeaderProps) => {
  const weekKey = toWeekString(weekStart);
  const instagramLabel = instagramPrepared
    ? "Edit Instagram"
    : "Prepare Instagram";

  return (
    <div class="flex items-center justify-between gap-2 p-3 border-b border-outline">
      <div>
        <span class="text-xs font-medium text-on-surface">
          Week {weekNumber}
        </span>
        <p class="text-sm font-medium text-on-surface-strong">
          {formatWeekRange(weekStart)}
        </p>
      </div>
      <div class="flex flex-col items-center justify-end gap-2">
        <RandomizeBOTDButton weekStart={weekStart} botdByDate={botdByDate} />
        <a
          href={`/dashboard/admin/planner/featured-hero/${weekKey}/prepare`}
          x-target="modal-root"
        >
          <Button variant="outline" color="secondary" width="auto">
            Featured hero
          </Button>
        </a>
        <a
          href={`/dashboard/admin/planner/instagram/${weekKey}/prepare`}
          x-target="modal-root"
          class={instagramButtonClasses(instagramPrepared)}
        >
          {instagramLabel}
        </a>
      </div>
    </div>
  );
};
