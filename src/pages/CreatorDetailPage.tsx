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
import SortDropdown from "../components/app/SortDropdown";

type CreatorDetailPageProps = {
  user: AuthUser | null;
  creatorSlug: string;
  currentPath: string;
  isMobile: boolean;
  currentPage: number;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
};

const CreatorDetailPage = async ({
  user,
  creatorSlug,
  currentPath,
  currentPage,
  sortBy,
}: CreatorDetailPageProps) => {
  const result = await getCreatorBySlug(creatorSlug, currentPage, sortBy);

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
  const baseUrlWithSort =
    sortBy !== "newest" ? `${currentPath}?sortBy=${sortBy}` : currentPath;

  return (
    <AppLayout title={creator?.displayName ?? ""} user={user}>
      <Page>
        <PageTitle creator={creator} user={user} />
        <div class="flex flex-col md:flex-row gap-4">
          <div class="md:w-4/5 flex flex-col gap-4">
            <div class="flex justify-end">
              <SortDropdown sortBy={sortBy} currentPath={currentPath} />
            </div>
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
              baseUrl={baseUrlWithSort}
              page={page}
              totalPages={totalPages}
              targetId={targetId}
            />
          </div>
          <div class="md:w-1/5">
            <CreatorCard
              creator={creator}
              currentPath={currentPath}
              user={user}
            />
          </div>
        </div>
      </Page>
    </AppLayout>
  );
};

export default CreatorDetailPage;
