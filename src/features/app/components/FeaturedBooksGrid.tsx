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
      <GridPanel>
        {featuredBooks?.length > 0 ? (
          featuredBooks.map((fb) => <BookCard book={fb.book} user={user} />)
        ) : (
          <div class="col-span-full text-center text-sm text-on-surface-weak py-4">
            No featured books found
          </div>
        )}
      </GridPanel>
    </>
  );
};

export default FeaturedBooksGrid;
