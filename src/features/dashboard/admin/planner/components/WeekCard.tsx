import Card from "../../../../../components/app/Card";
import { BookOfTheDayWithBook } from "../../../../app/BOTDServices";
import { toDateString } from "../../../../../lib/utils";
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
};

const WeekCard = ({
  weekStart,
  weekNumber,
  botdByDate,
  artistOfTheWeek,
  publisherOfTheWeek,
}: Props) => {
  const days = getWeekDays(weekStart);

  return (
    <Card className="flex flex-col">
      <WeekCardHeader weekStart={weekStart} weekNumber={weekNumber} />
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
};

const WeekCardHeader = ({ weekStart, weekNumber }: WeekCardHeaderProps) => (
  <div class="flex items-center justify-between p-3 border-b border-outline">
    <div>
      <span class="text-xs font-medium text-on-surface">Week {weekNumber}</span>
      <p class="text-sm font-medium text-on-surface-strong">
        {formatWeekRange(weekStart)}
      </p>
    </div>
  </div>
);
