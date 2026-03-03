import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import NavTabs from "../../components/NavTabs";
import AdminBooksTableContainer from "../components/AdminBooksTableContainer";
import { AuthUser, Flash } from "../../../../../../types";

type Props = {
  user: AuthUser;
  flash: Flash;
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};

const AdminBooksOverviewPage = async ({
  user,
  flash,
  searchQuery,
  currentPage,
  currentPath,
}: Props) => {
  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <AdminBooksTableContainer
          user={user}
          currentPath={currentPath}
          currentPage={currentPage}
          searchQuery={searchQuery}
        />
      </Page>
    </AppLayout>
  );
};

export default AdminBooksOverviewPage;
