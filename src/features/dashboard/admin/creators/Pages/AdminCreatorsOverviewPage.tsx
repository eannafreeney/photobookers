import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import NavTabs from "../../components/NavTabs";
import SectionTitle from "../../../../../components/app/SectionTitle";
import AdminCreatorsTableContainer from "../components/AdminCreatorsTableContainer";
import { AuthUser } from "../../../../../../types";

type Props = {
  user: AuthUser;
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};

const AdminCreatorsOverviewPage = ({
  user,
  searchQuery,
  currentPage,
  currentPath,
}: Props) => {
  return (
    <AppLayout title="New Creator" user={user}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/creators" />
        {/* <CreatorFormAdmin /> */}
        <AdminCreatorsTableContainer
          searchQuery={searchQuery}
          currentPage={currentPage}
          currentPath={currentPath}
        />
      </Page>
    </AppLayout>
  );
};
export default AdminCreatorsOverviewPage;
