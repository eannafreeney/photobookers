import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import GridPanel from "../../../components/app/GridPanel";
import SectionTitle from "../../../components/app/SectionTitle";
import { FeaturedBookOfTheWeekWithBook } from "../../dashboard/admin/planner/services";

type Props = {
  featuredBooks: FeaturedBookOfTheWeekWithBook[];
  user: AuthUser | null;
};

const FeaturedBooksGrid = ({ featuredBooks, user }: Props) => {
  if (!featuredBooks || featuredBooks.length === 0) return <></>;
  return (
    <>
      <div>
        <SectionTitle className="mb-4">Featured Books of the Week</SectionTitle>
      </div>
      {/* Mobile: horizontal scroll row */}
      <div class="flex gap-4 overflow-x-auto sm:hidden [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {featuredBooks.map((fb) => (
          <div class="min-w-[300px]">
            <BookCard book={fb.book} user={user} />
          </div>
        ))}
      </div>
      {/* sm+: normal grid */}
      <div class="hidden sm:block">
        <GridPanel>
          {featuredBooks.map((fb) => (
            <BookCard book={fb.book} user={user} />
          ))}
        </GridPanel>
      </div>
    </>
  );
};

export default FeaturedBooksGrid;
