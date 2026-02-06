
import AppLayout from "../components/layouts/AppLayout";
import { Book } from "../db/schema";
import { AuthUser } from "../../types";
import { capitalize } from "../utils";
import PageTitle from "../components/app/PageTitle";
import GridPanel from "../components/app/GridPanel";
import BookCard from "../components/app/BookCard";
import Page from "../components/layouts/Page";

type TagPageProps = {
  books: Book[];
  user: AuthUser | null;
  tag: string;
};

const TagPage = ({ books, user, tag }: TagPageProps) => {
  return (
    <AppLayout title={`# ${capitalize(tag)}`} user={user}>
      <Page>
      <PageTitle title={`# ${capitalize(tag)}`} />
      <GridPanel>
            {books.map((book) => (
              <BookCard book={book} user={user} />
            ))}
          </GridPanel>
            </Page>
    </AppLayout>
  );
};
export default TagPage;
