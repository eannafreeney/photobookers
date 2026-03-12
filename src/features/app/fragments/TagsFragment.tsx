import { AuthUser } from "../../../../types";
import ErrorPage from "../../../pages/error/errorPage";
import { capitalize } from "../../../utils";
import BooksGrid from "../components/BooksGrid";
import { getBooksByTag } from "../services";

type Props = {
  user: AuthUser;
  currentPage: number;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
  currentPath: string;
  tag: string;
};

const TagsFragment = async ({
  user,
  currentPage,
  sortBy,
  currentPath,
  tag,
}: Props) => {
  const result = await getBooksByTag(tag, currentPage, sortBy);

  if (!result?.books.length) {
    return (
      <div id="tag-books-fragment">
        <div class="flex justify-center items-center min-h-screen">
          No books found for this tag
        </div>
      </div>
    );
  }

  return (
    <div id="tag-books-fragment">
      <BooksGrid
        title={`# ${capitalize(tag)}`}
        user={user}
        currentPath={currentPath}
        sortBy={sortBy}
        result={result}
        showSortDropdown={false}
      />
    </div>
  );
};
export default TagsFragment;
