import { AuthUser } from "../../types";
import BookCard from "../components/app/BookCard";
import GridPanel from "../components/app/GridPanel";
import { getNewBooks } from "../services/books";

const NewTab = async ({ user }: { user: AuthUser }) => {
  const featuredBooks = await getNewBooks();
  if (!featuredBooks) {
    return <div>No featured books found</div>;
  }

  return (
    <div id="tab-content">
      <GridPanel isFullWidth>
        {featuredBooks.map((book) => (
          <BookCard book={book} user={user} />
        ))}
      </GridPanel>
    </div>
  );
};

export default NewTab;


