import { AuthUser } from "../../../../../types";
import Breadcrumbs from "../../admin/components/Breadcrumbs";
import { BooksOverviewTable } from "../tables/BooksOverviewTable";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { getBooksByArtistId, getBooksByPublisherId } from "../services";
import { CreatorStatus } from "../../../../db/schema";
import InfoPage from "../../../../pages/InfoPage";
import Button from "../../../../components/app/Button";

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
      <VerificationStatusBanner creatorStatus={user.creator.status ?? "stub"} />
      <Page>
        <Breadcrumbs items={[{ label: "Books Overview" }]} />
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

type VerificationStatusProps = {
  creatorStatus: CreatorStatus;
};

const VerificationStatusBanner = ({
  creatorStatus,
}: VerificationStatusProps) => {
  if (creatorStatus === "verified") return <></>;

  return (
    <div class="relative flex border-outline bg-surface-alt p-4 text-on-surface dark:border-outline-dark dark:bg-surface-dark-alt dark:text-on-surface-dark border-b">
      <div class="mx-auto flex flex-wrap items-center gap-2 px-6">
        <p class="sm:text-sm text-pretty text-xs">
          Your creator profile is pending verification. You can edit books, but
          publishing is disabled until verification.
        </p>
        <form method="post" action="/auth/resend-verification" x-target="toast">
          <Button variant="solid" color="warning">
            Resend verification email
          </Button>
        </form>
      </div>
    </div>
  );
};
