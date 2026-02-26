import { getBookById } from "../services/books";
import { AuthUser } from "../../types";

type BookPreviewPageProps = {
  bookId: string;
  user: AuthUser;
};

const BookPreviewPage = async ({ bookId, user }: BookPreviewPageProps) => {
  const book = await getBookById(bookId);
  return (
    <>
      <div>BookPreviewPage </div>
      <p>{JSON.stringify(book)}</p>
    </>
  );
};

export default BookPreviewPage;
