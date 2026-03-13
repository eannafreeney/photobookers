import { AuthUser } from "../../../../types";
import { capitalize } from "../../../utils";
import BooksGrid from "../components/BooksGrid";
import { getBooksByTag } from "../services";

type Props = {
  user: AuthUser;
  currentPage: number;
  currentPath: string;
  tag: string;
};

const TagsFragment = async ({ user, currentPage, currentPath, tag }: Props) => {
  const result = await getBooksByTag(tag, currentPage);

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
        result={result}
      />
    </div>
  );
};
export default TagsFragment;
