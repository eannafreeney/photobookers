import { AuthUser } from "../../../../types";
import SectionTitle from "../../../components/app/SectionTitle";
import { getThisWeeksBookOfTheWeek } from "../BOTWServices";
import BookOfTheWeekCard from "./BOTWCard";
import NewsletterCard from "./NewsletterCard";

type Props = {
  user: AuthUser | null;
  isMobile: boolean;
};

const BookOfTheWeekGrid = async ({ user, isMobile }: Props) => {
  const [err, bookOfTheWeek] = await getThisWeeksBookOfTheWeek();
  if (err) return <></>;

  return (
    <>
      <SectionTitle>Book of the Week</SectionTitle>
      <div class="grid grid-cols-1 md:grid-cols-8 gap-4 items-end w-full">
        <div class="col-span-2 md:col-span-6">
          <BookOfTheWeekCard
            isMobile={isMobile}
            bookOfTheWeek={bookOfTheWeek}
            user={user}
          />
        </div>
        <NewsletterCard />
      </div>
    </>
  );
};

export default BookOfTheWeekGrid;
