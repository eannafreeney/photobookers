import { AuthUser } from "../../../../../types";
import Breadcrumbs from "../../admin/components/Breadcrumbs";
import { BooksOverviewTable } from "../tables/BooksOverviewTable";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { getBooksByArtistId, getBooksByPublisherId } from "../services";
import AlertStatic from "../../../../components/app/AlertStatic";
import VerifiedCreator from "../../../../components/app/VerifiedCreator";
import { InfiniteScroll } from "../../../../components/app/InfiniteScroll";
import { CreatorStatus } from "../../../../db/schema";
import InfoPage from "../../../../pages/InfoPage";

type BooksDashboardProps = {
  user: AuthUser;
  flash: any;
  currentPath: string;
  searchQuery?: string;
  isMobile: boolean;
  currentPage: number;
};

const BooksOverview = async ({
  searchQuery,
  user,
  flash,
  currentPath,
  isMobile,
  currentPage,
}: BooksDashboardProps) => {
  if (!user.creator) return <></>;

  const creatorId = user.creator.id;
  const creatorType = user.creator.type;

  const [error, result] =
    creatorType === "artist"
      ? await getBooksByArtistId(creatorId, currentPage, searchQuery)
      : await getBooksByPublisherId(creatorId, currentPage, searchQuery);

  if (error) return <InfoPage errorMessage={error.reason} user={user} />;

  const { books, totalPages, page } = result;

  return (
    <AppLayout
      title="Books Overview"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs items={[{ label: "Books Overview" }]} />
        <VerifiedCreatorBadge creatorStatus={user.creator.status ?? "stub"} />
        <div class="flex flex-col gap-16">
          <BooksOverviewTable
            books={books}
            isMobile={isMobile}
            creator={user.creator}
            user={user}
            currentPath={currentPath}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </Page>
    </AppLayout>
  );
};

export default BooksOverview;

const VerifiedCreatorBadge = ({
  creatorStatus,
}: {
  creatorStatus: CreatorStatus;
}) => {
  if (creatorStatus !== "verified") return <></>;

  return (
    <div class="flex items-center gap-2">
      Account Verified{" "}
      <VerifiedCreator creatorStatus={creatorStatus} size="sm" />
    </div>
  );
};
