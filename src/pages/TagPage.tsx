import BookList from "../components/app/BookList";
import SectionTitle from "../components/app/SectionTitle";
import AppLayout from "../components/layouts/AppLayout";
import { Book } from "../db/schema";
import { AuthUser } from "../../types";
import { capitalize } from "../utils";

type TagPageProps = {
  books: Book[];
  user: AuthUser | null;
  tag: string;
};

const TagPage = ({ books, user, tag }: TagPageProps) => {
  return (
    <AppLayout title={`# ${capitalize(tag)}`} user={user}>
      <SectionTitle>{`# ${capitalize(tag)}`}</SectionTitle>
      <BookList books={books} />
    </AppLayout>
  );
};
export default TagPage;
