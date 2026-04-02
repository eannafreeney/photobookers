import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import { AuthUser } from "../../../../../../types";
import NavTabs from "../../components/NavTabs";
import InterviewsTableAdmin from "../components/InterviewsTableAdmin";

type Props = {
  user: AuthUser;
  currentPath: string;
  currentPage: number;
};

const InterviewsPageAdmin = ({ user, currentPath, currentPage }: Props) => {
  return (
    <AppLayout title="Admin Interviews" user={user} currentPath={currentPath}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <InterviewsTableAdmin
          currentPath={currentPath}
          currentPage={currentPage}
        />
      </Page>
    </AppLayout>
  );
};

export default InterviewsPageAdmin;
