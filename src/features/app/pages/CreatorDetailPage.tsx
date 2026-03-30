import { AuthUser } from "../../../../types";
import CreatorCard from "../../../components/app/CreatorCard";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import Divider from "../../../components/Divider";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { CreatorCardResult, BookCardResult } from "../../../constants/queries";
import { Book, Creator } from "../../../db/schema";
import InfoPage from "../../../pages/InfoPage";
import BooksGrid from "../components/BooksGrid";
import CreatorNavTabs from "../components/CreatorNavTabs";
import CreatorsGrid from "../components/RelatedCreators";
import { getBooksByCreatorSlug } from "../services";

type CreatorDetailPageProps = {
  user: AuthUser | null;
  creatorSlug: string;
  currentPath: string;
  currentPage: number;
  isMobile: boolean;
};

const CreatorDetailPage = async ({
  user,
  creatorSlug,
  currentPath,
  currentPage,
  isMobile,
}: CreatorDetailPageProps) => {
  const [error, result] = await getBooksByCreatorSlug(creatorSlug, currentPage);

  if (error) {
    return <InfoPage errorMessage={error.reason} user={user} />;
  }

  const { creator, relatedCreators, books, totalPages, page } = result;

  return (
    <AppLayout
      title={creator?.displayName ?? ""}
      user={user}
      currentPath={currentPath}
      adminEditHref={`/dashboard/admin/creators/${creator.id}/update`}
    >
      <Page>
        {isMobile ? (
          <CreatorDetailMobile
            creator={creator}
            user={user}
            currentPath={currentPath}
            showCreatorsTab={relatedCreators.length > 0}
            result={result}
          />
        ) : (
          <CreatorDetailDesktop
            creator={creator}
            user={user}
            currentPath={currentPath}
            relatedCreators={relatedCreators}
            result={result}
          />
        )}
      </Page>
    </AppLayout>
  );
};

export default CreatorDetailPage;

type CreatorDetailMobileProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
  showCreatorsTab: boolean;
};

const CreatorDetailMobile = ({
  creator,
  user,
  currentPath,
  result,
  showCreatorsTab,
}: CreatorDetailMobileProps) => (
  <div class="flex flex-col gap-4">
    <MobileCreatorCard creator={creator} user={user} />
    <CreatorNavTabs
      showCreatorsTab={showCreatorsTab}
      creator={creator}
      currentPath={currentPath}
    />
    <BooksGrid
      user={user}
      currentPath={currentPath}
      result={result}
      currentCreatorId={creator.id}
      noResultsMessage="No books found"
    />
  </div>
);

type CreatorDetailDesktopProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
  relatedCreators: CreatorCardResult[];
  result: {
    books: BookCardResult[];
    totalPages: number;
    page: number;
  };
};

export const CreatorDetailDesktop = ({
  creator,
  user,
  currentPath,
  relatedCreators,
  result,
}: CreatorDetailDesktopProps) => {
  const title = creator.type === "publisher" ? "Artists" : "Publishers";

  return (
    <div class="flex flex-col md:flex-row gap-4">
      <div class="md:w-4/5 flex flex-col gap-4">
        <BooksGrid
          isFullWidth={false}
          title="Books"
          user={user}
          currentPath={currentPath}
          result={result}
          currentCreatorId={creator.id}
          noResultsMessage="No books found"
        />
        <Divider />
        <CreatorsGrid creators={relatedCreators} title={title} />
      </div>
      <div class="md:w-1/5">
        <CreatorCard creator={creator} currentPath={currentPath} user={user} />
      </div>
    </div>
  );
};
