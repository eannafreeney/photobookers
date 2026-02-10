import AppLayout from "../components/layouts/AppLayout";
import { Book } from "../db/schema";
import { AuthUser } from "../../types";
import { capitalize } from "../utils";
import PageTitle from "../components/app/PageTitle";
import GridPanel from "../components/app/GridPanel";
import BookCard from "../components/app/BookCard";
import Page from "../components/layouts/Page";
import NavTabs from "../components/layouts/NavTabs";

type TagPageProps = {
  books: Book[];
  user: AuthUser | null;
  tag: string;
};

const TagPage = async ({ books, user, tag }: TagPageProps) => {
  if (!books) {
    return (
      <AppLayout title="Books" user={user}>
        <Page>
          <div>No books found</div>
        </Page>
      </AppLayout>
    );
  }

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
