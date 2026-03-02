import AppLayout from "../../../../../components/layouts/AppLayout";
import NavTabs from "../../components/NavTabs";
import { AuthUser } from "../../../../../../types";
import Page from "../../../../../components/layouts/Page";
import CreateUserFormAdmin from "../forms/CreateUserFormAdmin";
import UsersTableAdmin from "../components/UsersTableAdmin";

type Props = {
  user: AuthUser;
  currentPath: string;
};

const UsersPageAdmin = ({ user, currentPath }: Props) => {
  return (
    <AppLayout title="Admin Dashboard" user={user}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <CreateUserFormAdmin />
        <UsersTableAdmin />
      </Page>
    </AppLayout>
  );
};

export default UsersPageAdmin;
