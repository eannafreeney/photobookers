import Card from "../../../../../components/app/Card";
import { formatWeekRange } from "../utils";
import { BookOfTheWeekWithBook } from "../../../../app/BOTWServices";
import {
  ArtistOfTheWeekWithCreator,
  FeaturedBookOfTheWeekWithBook,
  PublisherOfTheWeekWithCreator,
} from "../services";
import FeaturedBooksList from "./FeaturedBooksList";
import BOTWCard from "./BOTWCard";
import AOTWCard from "./AOTWCard";
import POTWCard from "./POTWCard";

type Props = {
  weekStart: Date;
  weekNumber: number;
  bookOfTheWeek: BookOfTheWeekWithBook | null;
  featuredBooks: FeaturedBookOfTheWeekWithBook[];
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const WeekCard = ({
  weekStart,
  weekNumber,
  bookOfTheWeek,
  featuredBooks,
  artistOfTheWeek,
  publisherOfTheWeek,
}: Props) => {
  return (
    <Card className="flex flex-col">
      <WeekCardHeader weekStart={weekStart} weekNumber={weekNumber} />
      <Card.Body gap="2">
        <BOTWCard weekStart={weekStart} bookOfTheWeek={bookOfTheWeek} />
        <FeaturedBooksList
          weekStart={weekStart}
          featuredBooks={featuredBooks}
        />
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
      <span class="text-xs font-medium text-on-surface-weak">
        Week {weekNumber}
      </span>
      <p class="text-sm font-medium text-on-surface-strong">
        {formatWeekRange(weekStart)}
      </p>
    </div>
  </div>
);
