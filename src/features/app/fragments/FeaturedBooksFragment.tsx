import { AuthUser } from "../../../../types";
import FeaturedBooksGrid from "../components/FeaturedBooksGrid";
import { getThisWeeksFeaturedBooks } from "../FeaturedServices";

type Props = {
  user: AuthUser;
};

const FeaturedBooksFragment = async ({ user }: Props) => {
  const featuredBooks = await getThisWeeksFeaturedBooks();

  return (
    <div id="featured-books-fragment">
      <FeaturedBooksGrid featuredBooks={featuredBooks} user={user} />
    </div>
  );
};
export default FeaturedBooksFragment;
