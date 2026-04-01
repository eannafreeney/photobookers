import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import NavTabs from "../../components/NavTabs";
import { AuthUser } from "../../../../../../types";
import NotificationsTableAdmin from "../components/NotificationsTableAdmin";

type Props = {
  user: AuthUser;
  currentPath: string;
  currentPage: number;
};

const NotificationsPageAdmin = ({ user, currentPath, currentPage }: Props) => {
  return (
    <AppLayout
      title="Admin Notifications"
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <NavTabs currentPath={currentPath} />
        <NotificationsTableAdmin
          currentPath={currentPath}
          currentPage={currentPage}
        />
      </Page>
    </AppLayout>
  );
};

export default NotificationsPageAdmin;
