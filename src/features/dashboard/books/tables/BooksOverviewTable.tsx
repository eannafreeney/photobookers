import { AuthUser } from "../../../../../types";
import { Book, Creator } from "../../../../db/schema";
import BooksOverviewDesktop from "../components/BooksOverviewDesktop";
import BooksOverviewMobile from "../components/BooksOverviewMobile";

type BookTableProps = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  creator: Creator;
  user: AuthUser;
  isMobile: boolean;
  currentPath: string;
  page: number;
  totalPages: number;
  reorderEnabled?: boolean;
};

export const BooksOverviewTable = async ({
  books,
  creator,
  user,
  isMobile,
  currentPath,
  page,
  totalPages,
  reorderEnabled = false,
}: BookTableProps) => {
  if (!user || !creator) return <></>;

  if (isMobile) {
    return (
      <BooksOverviewMobile
        books={books}
        user={user}
        currentPath={currentPath}
        page={page}
        totalPages={totalPages}
      />
    );
  }

  return (
    <BooksOverviewDesktop
      books={books}
      user={user}
      currentPath={currentPath}
      page={page}
      totalPages={totalPages}
      reorderEnabled={reorderEnabled}
    />
  );
};
