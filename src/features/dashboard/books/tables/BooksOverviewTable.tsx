import { AuthUser } from "../../../../../types";
import { Creator } from "../../../../db/schema";
import { getBooksByCreatorId } from "../services";
import BooksOverviewDesktop from "../components/BooksOverviewDesktop";
import BooksOverviewMobile from "../components/BooksOverviewMobile";

type BookTableProps = {
  searchQuery?: string;
  creator: Creator;
  user: AuthUser | null;
  isMobile: boolean;
  currentPage: number;
  title?: string;
};

export const BooksOverviewTable = async ({
  searchQuery,
  creator,
  user,
  isMobile,
  currentPage,
  title,
}: BookTableProps) => {
  if (!user || !creator) return <></>;

  const result = await getBooksByCreatorId(
    creator.id,
    creator.type,
    currentPage,
    searchQuery,
  );

  const validBooks = result?.books?.filter((book) => book != null);

  if (isMobile) {
    return (
      <BooksOverviewMobile books={validBooks ?? []} user={user} title={title} />
    );
  }

  return (
    <BooksOverviewDesktop books={validBooks ?? []} user={user} title={title} />
  );
};
