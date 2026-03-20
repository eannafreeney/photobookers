import { AuthUser } from "../../../../types";
import CreatorCard from "../../../components/app/CreatorCard";
import MobileCreatorCard from "../../../components/app/MobileCreatorCard";
import Divider from "../../../components/Divider";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import { Creator } from "../../../db/schema";
import ErrorPage from "../../../pages/error/errorPage";
import BooksGrid from "../components/BooksGrid";
import CreatorsGrid from "../components/RelatedCreators";
import { getBooksByCreatorSlug } from "../services";

type CreatorDetailPageProps = {
  user: AuthUser | null;
  creatorSlug: string;
  currentPath: string;
  isMobile: boolean;
  currentPage: number;
  sortBy: "newest" | "oldest" | "title_asc" | "title_desc";
  currentCreatorId?: string | null;
};

const CreatorDetailPage = async ({
  user,
  creatorSlug,
  currentPath,
  currentPage,
  isMobile,
  currentCreatorId,
}: CreatorDetailPageProps) => {
  const result = await getBooksByCreatorSlug(creatorSlug, currentPage);

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
              isFullWidth={false}
              title={isMobile ? undefined : creator.displayName}
              user={user}
              currentPath={currentPath}
              result={{ ...rest }}
              currentCreatorId={creator.id}
            />
            <Divider />
            <CreatorsGrid creators={relatedCreators} title={title} />
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

type CreatorDetailMobileProps = {
  creator: Creator;
  user: AuthUser | null;
  currentPath: string;
};

const CreatorDetailMobile = ({
  creator,
  user,
  currentPath,
}: CreatorDetailMobileProps) => (
  <div class="flex flex-col gap-4">
    {/* <MobileCreatorCard creator={creator} user={user} />
    <BooksGrid
      creator={creator}
      user={user}
      currentPath={currentPath}
      result={{ ...rest }}
    /> */}
  </div>
);
