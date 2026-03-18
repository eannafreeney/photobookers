import { AuthUser } from "../../../../types";
import { BookCardResult } from "../../../constants/queries";
import RelatedBooks from "../components/RelatedBooks";

type RelatedBooksFragmentProps = {
  book: BookCardResult | null;
  user: AuthUser | null;
};

const RelatedBooksFragment = ({ book, user }: RelatedBooksFragmentProps) => {
  if (!book) return <></>;

  return (
    <div id="related-books-fragment">
      <RelatedBooks book={book} user={user} />
    </div>
  );
};

export default RelatedBooksFragment;
