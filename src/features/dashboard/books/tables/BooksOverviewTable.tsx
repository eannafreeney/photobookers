import { AuthUser } from "../../../../../types";
import { Book, Creator } from "../../../../db/schema";
import BooksOverviewDesktop from "../components/BooksOverviewDesktop";

type BookTableProps = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  creator: Creator;
  user: AuthUser;
  isMobile: boolean;
  currentPath: string;
  page: number;
  totalPages: number;
};

export const BooksOverviewTable = async ({
  books,
  creator,
  user,
  isMobile,
  currentPath,
  page,
  totalPages,
}: BookTableProps) => {
  if (!user || !creator) return <></>;

  if (isMobile) {
    return <span>Please use a desktop browser to view this page.</span>;
    // return <BooksOverviewMobile books={books} user={user} />;
  }

  return (
    <BooksOverviewDesktop
      books={books}
      user={user}
      currentPath={currentPath}
      page={page}
      totalPages={totalPages}
    />
  );
};
