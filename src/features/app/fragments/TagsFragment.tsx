import { AuthUser } from "../../../../types";
import SectionTitle from "../../../components/app/SectionTitle";
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
  const [error, result] = await getBooksByTag(tag, currentPage);

  if (error || !result?.books.length) {
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
      <div class="flex items-center justify-between">
        <SectionTitle>{`# ${capitalize(tag)}`}</SectionTitle>
      </div>
      <BooksGrid user={user} currentPath={currentPath} result={result} />
    </div>
  );
};
export default TagsFragment;
