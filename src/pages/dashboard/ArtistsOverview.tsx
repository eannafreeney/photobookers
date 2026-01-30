import { AuthUser } from "../../../types";
import ArtistsTable from "../../components/cms/ui/ArtistsTable";
import { DashboardLayout } from "../../components/layouts/DashboardLayout";
import { Creator } from "../../db/schema";
import Page from "../../components/layouts/Page";

type ArtistsOverviewProps = {
  user: AuthUser;
  searchQuery?: string | null;
  flash: any;
};

const ArtistsOverview = ({
  searchQuery,
  user,
  flash,
}: ArtistsOverviewProps) => {
  if (!user.creator) {
    return <div class="alert alert-error">No creator found</div>;
  }

  return (
    <DashboardLayout user={user} flash={flash}>
      <Page>
        <ArtistsTable searchQuery={searchQuery} />
      </Page>
    </DashboardLayout>
  );
};
export default ArtistsOverview;
