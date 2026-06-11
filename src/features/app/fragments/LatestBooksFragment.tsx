import { AuthUser } from "../../../../types";
import { getLatestBooks } from "../services";
import BooksGrid from "../components/BooksGrid";
import { isErr } from "../../../lib/result";
import Button from "../../../components/app/Button";
import SectionTitle from "../../../components/app/SectionTitle";
import ViewAllLink from "../components/ViewAllLink";

type Props = {
  user: AuthUser;
  currentPage: number;
  currentPath: string;
};

const LatestBooksFragment = async ({
  user,
  currentPage,
  currentPath,
}: Props) => {
  const [error, result] = await getLatestBooks(currentPage, 10);

  if (error) return <></>;

  return (
    <div id="latest-books-fragment">
      <div class="flex items-end justify-between mb-3 mt-10 border-t-2 border-on-surface-strong pt-3">
        <SectionTitle className="mb-0" kicker="New Arrivals">
          Latest Books
        </SectionTitle>
        <ViewAllLink href="/books" />
      </div>
      <BooksGrid
        user={user}
        currentPath={currentPath}
        result={result}
        isPaginated={false}
      />
      <div class="flex justify-center mt-8">
        <a href="/books">
          <Button variant="solid" color="primary" width="xl">
            View All Books →
          </Button>
        </a>
      </div>
    </div>
  );
};
export default LatestBooksFragment;
