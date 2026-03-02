import ErrorPage from "../../../../pages/error/errorPage";
import BooksTable from "../../admin/books/components/BooksTable";
import { getBooksByCreatorId } from "../services";

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
