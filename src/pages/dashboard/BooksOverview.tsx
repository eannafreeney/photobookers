import { AuthUser } from "../../../types";
import AlertStatic from "../../components/app/AlertStatic";
import Breadcrumbs from "../../components/app/Breadcrumbs";
import VerifiedCreator from "../../components/app/VerifiedCreator";
import BooksCreatedByMeForOtherPublishersTable from "../../components/cms/ui/BooksCreatedByMeForOtherPublishersTable";
import BooksCreatedByMeForStubPublishersTable from "../../components/cms/ui/BooksCreatedForStubPublishersTable";
import BooksForApprovalTable from "../../components/cms/ui/BooksForApprovalTable";
import { BooksOverviewTable } from "../../components/dashboard/BooksOverviewTable";
import AppLayout from "../../components/layouts/AppLayout";
import FeatureGuard from "../../components/layouts/FeatureGuard";
import Page from "../../components/layouts/Page";
import ErrorPage from "../error/errorPage";

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
  if (!user.creator) {
    return (
      <ErrorPage
        errorMessage="You are not authorized to access this page. Please contact support."
        user={user}
      />
    );
  }

  return (
    <AppLayout
      title="Books Overview"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs items={[{ label: "Books Overview" }]} />
        {user.creator.status !== "verified" ? (
          <AlertStatic
            type="info"
            message="Your creator profile is not verified yet. In the meantime, you can start uploading books, or update your profile pic."
          />
        ) : (
          <div class="flex items-center gap-2">
            Account Verified{" "}
            <VerifiedCreator creator={user.creator} size="sm" />
          </div>
        )}
        <div class="flex flex-col gap-16">
          <BooksOverviewTable
            isMobile={isMobile}
            searchQuery={searchQuery}
            creator={user.creator}
            user={user}
            currentPage={currentPage}
          />
          <FeatureGuard flagName="artists-can-create-stub-publishers">
            {user.creator.type === "artist" ? (
              <ArtistTables />
            ) : (
              <PublisherTables creatorId={user.creator.id} />
            )}
          </FeatureGuard>
        </div>
      </Page>
    </AppLayout>
  );
};

export default BooksOverview;

const ArtistTables = () => (
  <>
    <BooksCreatedByMeForOtherPublishersTable />
    <BooksCreatedByMeForStubPublishersTable />
  </>
);

const PublisherTables = ({ creatorId }: { creatorId: string }) => (
  <BooksForApprovalTable creatorId={creatorId} />
);
