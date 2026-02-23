import ErrorPage from "../../pages/error/errorPage";
import { getBooksByCreatorId } from "../../services/books";
import BooksTable from "../admin/BooksTable";

type Props = {
  creatorId: string;
  creatorType: "artist" | "publisher";
  currentPath: string;
  currentPage: number;
};

const CreatorBookList = async ({
  creatorId,
  creatorType,
  currentPath,
  currentPage,
}: Props) => {
  const result = await getBooksByCreatorId(creatorId, creatorType, currentPage);

  if (!result?.books) {
    return <ErrorPage errorMessage="No books found" />;
  }

  const { books, totalPages, page } = result;

  return (
    <BooksTable
      totalPages={totalPages}
      page={page}
      books={books}
      currentPath={currentPath}
    />
  );
};

export default CreatorBookList;
