import { AuthUser } from "../../../../../types";
import { Book, Creator } from "../../../../db/schema";
import BooksOverviewDesktop from "../components/BooksOverviewDesktop";
import BooksOverviewMobile from "../components/BooksOverviewMobile";

type BookTableProps = {
  books: (Book & { artist: Creator | null; publisher: Creator | null })[];
  creator: Creator;
  user: AuthUser;
  isMobile: boolean;
  totalPages: number;
  page: number;
  creatorType: "artist" | "publisher";
};

export const BooksOverviewTable = async ({
  books,
  creator,
  user,
  isMobile,
  totalPages,
  page,
  creatorType,
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
      totalPages={totalPages}
      page={page}
      creatorType={creatorType}
    />
  );
};
