import AppLayout from "../components/layouts/AppLayout";
import { AuthUser } from "../../types";
import Page from "../components/layouts/Page";
import CreatorCard from "../components/app/CreatorCard";
import { getCreatorBySlug } from "../services/creators";
import PageTitle from "../components/app/PageTitle";
import GridPanel from "../components/app/GridPanel";
import BookCard from "../components/app/BookCard";
import ErrorPage from "./error/errorPage";
import { Pagination } from "../components/app/Pagination";

type CreatorDetailPageProps = {
  user: AuthUser | null;
  creatorSlug: string;
  currentPath: string;
  isMobile: boolean;
  currentPage: number;
};

const CreatorDetailPage = async ({
  user,
  creatorSlug,
  currentPath,
  isMobile,
  currentPage,
}: CreatorDetailPageProps) => {
  const result = await getCreatorBySlug(creatorSlug, currentPage);

  if (!result.creator) {
    return <ErrorPage errorMessage="Creator not found" user={user} />;
  }

  const { creator, books, totalPages, page } = result;

  if (!books.length) {
    return (
      <ErrorPage errorMessage="No books found for this creator" user={user} />
    );
  }

  const targetId = `books-grid-${creator.id}`;

  return (
    <AppLayout title={creator?.displayName ?? ""} user={user}>
      <Page>
        <PageTitle creator={creator} isMobile={isMobile} />
        <div class="flex flex-col md:flex-row gap-4">
          <div class="md:w-3/4 flex flex-col gap-4">
            <GridPanel id={targetId} xMerge="append">
              {books.map((book) => (
                <BookCard
                  book={book}
                  user={user}
                  creatorType={creator.type}
                  currentCreatorId={creator.id}
                />
              ))}
            </GridPanel>
            <Pagination
              baseUrl={currentPath}
              page={page}
              totalPages={totalPages}
              targetId={targetId}
            />
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
