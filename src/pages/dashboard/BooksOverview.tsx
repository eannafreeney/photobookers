import { AuthUser } from "../../../types";
import Alert from "../../components/app/Alert";
import Breadcrumbs from "../../components/app/Breadcrumbs";
import BooksCreatedByMeForOtherPublishersTable from "../../components/cms/ui/BooksCreatedByMeForOtherPublishersTable";
import BooksCreatedByMeForStubPublishersTable from "../../components/cms/ui/BooksCreatedForStubPublishersTable";
import BooksForApprovalTable from "../../components/cms/ui/BooksForApprovalTable";
import { BookTable } from "../../components/cms/ui/BookTable";
import AppLayout from "../../components/layouts/AppLayout";
import FeatureGuard from "../../components/layouts/FeatureGuard";
import Page from "../../components/layouts/Page";
import ErrorPage from "../error/errorPage";

type BooksDashboardProps = {
  user: AuthUser;
  flash: any;
  currentPath: string;
  searchQuery?: string;
};

const BooksOverview = async ({
  searchQuery,
  user,
  flash,
  currentPath,
}: BooksDashboardProps) => {
  if (!user.creator) {
    return (
      <ErrorPage errorMessage="You are not authorized to access this page. Please contact support." />
    );
  }

  const creatorType = user.creator.type;

  return (
    <AppLayout
      title="Books Overview"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs items={[{ label: "Books Overview" }]} />
        {user.creator.status !== "verified" && (
          <div class="alert alert-info text-white rounded-md">
            Your creator profile is not verified yet. In the meantime, you can
            start uploading books, or update your profile pic.
          </div>
        )}
        <div class="flex flex-col gap-16">
          <BookTable
            searchQuery={searchQuery}
            creatorId={user.creator.id}
            creatorType={creatorType}
            user={user}
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
