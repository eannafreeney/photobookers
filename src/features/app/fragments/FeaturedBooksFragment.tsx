import { AuthUser } from "../../../../types";
import FeaturedBooksGrid from "../components/FeaturedBooksGrid";
import { getThisWeeksFeaturedBooks } from "../FeaturedServices";

type Props = {
  user: AuthUser;
};

const FeaturedBooksFragment = async ({ user }: Props) => {
  const [error, result] = await getThisWeeksFeaturedBooks();
  if (error) return <div>Error: {error.reason}</div>;
  const { featuredBooks } = result;

  if (!featuredBooks || featuredBooks.length === 0)
    return <div>No featured books found</div>;

  return (
    <div id="featured-books-fragment">
      <FeaturedBooksGrid featuredBooks={featuredBooks} user={user} />
    </div>
  );
};

export default FeaturedBooksFragment;
