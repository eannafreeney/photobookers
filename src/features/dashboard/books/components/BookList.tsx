import ErrorPage from "../../../../pages/error/errorPage";
import BooksTable from "../../admin/books/components/AdminBooksTableContainer";
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

  return <div>FIX THIS COMPONENT</div>;
  // return (
  //   <BooksTable
  //     totalPages={totalPages}
  //     page={page}
  //     books={books}
  //     currentPath={currentPath}
  //   />
  // );
};

export default CreatorBookList;
