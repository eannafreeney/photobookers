import { AuthUser } from "../../../../types";
import BookCard from "../../../components/app/BookCard";
import CreatorCard from "../../../components/app/CreatorCard";
import GridPanel from "../../../components/app/GridPanel";
import PageTitle from "../../../components/app/PageTitle";
import { Pagination } from "../../../components/app/Pagination";
import SortDropdown from "../../../components/app/SortDropdown";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import ErrorPage from "../../../pages/error/errorPage";
import BooksGrid from "../components/BooksGrid";
import { getBooksByCreatorSlug } from "../services";

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
  const result = await getBooksByCreatorSlug(creatorSlug, currentPage, sortBy);

  if (!result.creator) {
    return <ErrorPage errorMessage="Creator not found" user={user} />;
  }

  const { creator, ...rest } = result;

  return (
    <AppLayout title={creator?.displayName ?? ""} user={user}>
      <Page>
        <div class="flex flex-col md:flex-row gap-4">
          <div class="md:w-4/5 flex flex-col gap-4">
            <BooksGrid
              user={user}
              currentPath={currentPath}
              sortBy={sortBy}
              result={{ ...rest }}
            />
            {/* <div class="flex flex-col md:flex-row justify-between items-center gap-1">
              <PageTitle creator={creator} user={user} />
              <div class="flex justify-end">
                <SortDropdown sortBy={sortBy} currentPath={currentPath} />
              </div>
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
            /> */}
          </div>
          <div class="md:w-1/5 md:mt-14">
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
