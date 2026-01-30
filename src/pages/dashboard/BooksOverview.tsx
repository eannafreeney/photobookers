import { AuthUser } from "../../../types";
import Breadcrumbs from "../../components/app/Breadcrumbs";
import Button from "../../components/app/Button";
import Link from "../../components/app/Link";
import SectionTitle from "../../components/app/SectionTitle";
import BooksCreatedByMeForOtherPublishersTable from "../../components/cms/ui/BooksCreatedByMeForOtherPublishersTable";
import BooksCreatedByMeForStubPublisherTable from "../../components/cms/ui/BooksCreatedByMeForOtherPublishersTable";
import BooksCreatedByMeForStubPublishersTable from "../../components/cms/ui/BooksCreatedForStubPublishersTable";
import BooksForApprovalTable from "../../components/cms/ui/BooksForApprovalTable";
import { BookTable } from "../../components/cms/ui/BookTable";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import { getInputIcon } from "../../utils";

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
    return <div class="alert alert-error">No creator found</div>;
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
        <div class="flex flex-col gap-16">
          <BookTable searchQuery={searchQuery} creatorId={user.creator.id} />
          {user.creator.type === "artist" ? (
            <>
              <BooksCreatedByMeForOtherPublishersTable />
              <BooksCreatedByMeForStubPublishersTable />
            </>
          ) : (
            <BooksForApprovalTable creatorId={user.creator.id} />
          )}
        </div>
      </Page>
    </AppLayout>
  );
};

export default BooksOverview;
