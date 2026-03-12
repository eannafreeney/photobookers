import AppLayout from "../../../../../components/layouts/AppLayout";
import NavTabs from "../../components/NavTabs";
import { AuthUser } from "../../../../../../types";
import Page from "../../../../../components/layouts/Page";
import CreateUserFormAdmin from "../forms/CreateUserFormAdmin";
import UsersTableAdmin from "../components/UsersTableAdmin";

type Props = {
  user: AuthUser;
  currentPath: string;
  searchQuery?: string;
  currentPage: number;
};

const UsersPageAdmin = ({
  user,
  currentPath,
  searchQuery,
  currentPage,
}: Props) => {
  return (
    <AppLayout title="Admin Dashboard" user={user} currentPath={currentPath}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <CreateUserFormAdmin />
        <UsersTableAdmin
          currentPage={currentPage}
          searchQuery={searchQuery}
          currentPath={currentPath}
        />
      </Page>
    </AppLayout>
  );
};

export default UsersPageAdmin;
