import AppLayout from "../components/layouts/AppLayout";
import { AuthUser } from "../../types";
import Page from "../components/layouts/Page";
import CreatorCard from "../components/app/CreatorCard";
import { getCreatorBySlug } from "../services/creators";
import PageTitle from "../components/app/PageTitle";
import GridPanel from "../components/app/GridPanel";
import BookCard from "../components/app/BookCard";
import Link from "../components/app/Link";
import Button from "../components/app/Button";

type CreatorDetailPageProps = {
  user: AuthUser | null;
  creatorSlug: string;
  currentPath: string;
};

const CreatorDetailPage = async ({
  user,
  creatorSlug,
  currentPath,
}: CreatorDetailPageProps) => {
  const result = await getCreatorBySlug(creatorSlug);

  if (!result.creator) {
    return (
      <AppLayout title="Creator not found" user={user}>
        <p>Creator not found</p>
      </AppLayout>
    );
  }

  const { creator } = result;
  const books =
    creator.type === "publisher"
      ? creator?.booksAsPublisher
      : creator?.booksAsArtist || [];

  if (!books.length) {
    return (
      <AppLayout title="No Books Found" user={user}>
        <Page>
          <div class="flex flex-col gap-4 items-center justify-center h-screen">
            <p>No books found for this creator</p>
            <Link href="/books">
              <Button variant="solid" color="primary">
                View all books
              </Button>
            </Link>
          </div>
        </Page>
      </AppLayout>
    );
  }

  return (
    <AppLayout title={creator?.displayName ?? ""} user={user}>
      <Page>
        <PageTitle creator={creator} />
        <div class="flex flex-col md:flex-row gap-4">
          <div class="md:w-3/4 flex flex-col gap-4">
            <GridPanel>
              {books.map((book) => (
                <BookCard book={book} user={user} creatorType={creator.type} />
              ))}
            </GridPanel>
          </div>
          <div class="md:w-1/4">
            <CreatorCard
              creator={creator}
              currentPath={currentPath}
              orientation="portrait"
              user={user}
            />
          </div>
        </div>
      </Page>
    </AppLayout>
  );
};

export default CreatorDetailPage;
