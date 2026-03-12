import { AuthUser } from "../../../../types";
import CreatorCard from "../../../components/app/CreatorCard";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import Divider from "../../../components/Divider";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import ErrorPage from "../../../pages/error/errorPage";
import BooksGrid from "../components/BooksGrid";
import CreatorsGrid from "../components/RelatedCreators";
import { getBooksByCreatorSlug, getRelatedCreators } from "../services";

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
  isMobile,
}: CreatorDetailPageProps) => {
  const result = await getBooksByCreatorSlug(creatorSlug, currentPage, sortBy);

  if (!result.creator) {
    return <ErrorPage errorMessage="Creator not found" user={user} />;
  }

  const { creator, relatedCreators, ...rest } = result;

  const title = creator.type === "publisher" ? "Artists" : "Publishers";

  return (
    <AppLayout
      title={creator?.displayName ?? ""}
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <div class="flex flex-col md:flex-row gap-4">
          {isMobile && <MobileCreatorCard creator={creator} user={user} />}
          <div class="md:w-4/5 flex flex-col gap-4">
            <BooksGrid
              creator={creator}
              user={user}
              currentPath={currentPath}
              sortBy={sortBy}
              result={{ ...rest }}
              isMobile={isMobile}
            />
            <Divider />
            <CreatorsGrid creators={relatedCreators} title={title} />
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
