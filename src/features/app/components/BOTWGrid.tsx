import { AuthUser } from "../../../../types";
import SectionTitle from "../../../components/app/SectionTitle";
import { getThisWeeksBookOfTheWeek } from "../BOTWServices";
import NewsletterCard from "./NewsletterCard";

type Props = {
  user: AuthUser | null;
  isMobile: boolean;
};

const BookOfTheWeekGrid = async ({ user, isMobile }: Props) => {
  const bookOfTheWeek = await getThisWeeksBookOfTheWeek();

  if (!bookOfTheWeek) {
    return <></>;
  }

  return (
    <>
      <SectionTitle>{star} Book of the Week</SectionTitle>
      <div class="grid grid-cols-1 md:grid-cols-8 gap-4 items-end w-full">
        <div class="col-span-2 md:col-span-6">
          <BookOfTheWeekCard
            isMobile={isMobile}
            bookOfTheWeek={bookOfTheWeek}
            user={user}
          />
        </div>
        <NewsletterCard className="col-span-2" />
      </div>
    </>
  );
};

export default BookOfTheWeekGrid;
