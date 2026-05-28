import Card from "../../../../../components/app/Card";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import { toDateString } from "../../../../../lib/utils";
import { NewsletterCampaignStatus } from "../../../../../db/schema";
import {
  ArtistOfTheWeekWithCreator,
  PublisherOfTheWeekWithCreator,
} from "../services";
import BOTDCard from "./BOTDCard";
import AOTWCard from "./AOTWCard";
import POTWCard from "./POTWCard";
import { formatWeekRange, getWeekDays } from "../utils";

type Props = {
  weekStart: Date;
  weekNumber: number;
  botdByDate: Map<string, BookOfTheDayWithBook>;
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
  newsletterStatus: NewsletterCampaignStatus | null;
};

const WeekCard = ({
  weekStart,
  weekNumber,
  botdByDate,
  artistOfTheWeek,
  publisherOfTheWeek,
  newsletterStatus,
}: Props) => {
  const days = getWeekDays(weekStart);

  return (
    <Card className="flex flex-col">
      <WeekCardHeader
        weekStart={weekStart}
        weekNumber={weekNumber}
        newsletterStatus={newsletterStatus}
      />
      <Card.Body gap="2">
        {days.map((day) => {
          const key = toDateString(day);
          const botd = botdByDate.get(key) ?? null;
          return <BOTDCard key={key} date={day} bookOfTheDay={botd} />;
        })}
        <AOTWCard weekStart={weekStart} artistOfTheWeek={artistOfTheWeek} />
        <POTWCard
          weekStart={weekStart}
          publisherOfTheWeek={publisherOfTheWeek}
        />
      </Card.Body>
    </Card>
  );
};

export default WeekCard;

type WeekCardHeaderProps = {
  weekStart: Date;
  weekNumber: number;
  newsletterStatus: NewsletterCampaignStatus | null;
};

const newsletterButtonClasses = (
  status: NewsletterCampaignStatus | null,
): string => {
  const base = "rounded border px-2 py-1 text-xs font-medium opacity-80";
  switch (status) {
    case "draft":
      return `${base} border-warning bg-warning text-on-warning hover:opacity-90`;
    case "sent":
      return `${base} border-success bg-success text-on-success hover:opacity-90`;
    case "failed":
      return `${base} border-danger bg-danger text-on-danger hover:opacity-90`;
    default:
      return `${base} border-outline bg-surface-alt text-on-surface hover:bg-surface`;
  }
};

const newsletterButtonLabel = (status: NewsletterCampaignStatus | null) => {
  if (status === "sent") return "Newsletter sent";
  return "Weekly newsletter";
};

const WeekCardHeader = ({
  weekStart,
  weekNumber,
  newsletterStatus,
}: WeekCardHeaderProps) => {
  const buttonLabel = newsletterButtonLabel(newsletterStatus);

  return (
    <div class="flex items-center justify-between p-3 border-b border-outline">
      <div>
        <span class="text-xs font-medium text-on-surface">
          Week {weekNumber}
        </span>
        <p class="text-sm font-medium text-on-surface-strong">
          {formatWeekRange(weekStart)}
        </p>
      </div>
      <a
        href={`/dashboard/admin/planner/newsletters?weekStart=${toDateString(weekStart)}`}
        class={newsletterButtonClasses(newsletterStatus)}
      >
        {buttonLabel}
      </a>
    </div>
  );
};
