import { AuthUser } from "../../../../types";
import SectionTitle from "../../../components/app/SectionTitle";
import { BookOfTheWeekWithBook } from "../BOTWServices";
import BookOfTheWeekCard from "./BOTWCard";
import NewsletterCard from "./NewsletterCard";

type Props = {
  bookOfTheWeek: BookOfTheWeekWithBook;
  user: AuthUser | null;
  isMobile: boolean;
};

const BookOfTheWeekGrid = async ({ bookOfTheWeek, user, isMobile }: Props) => {
  if (!bookOfTheWeek) return <></>;

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
        <NewsletterCard className="col-span-2" />
      </div>
    </>
  );
};

export default BookOfTheWeekGrid;
