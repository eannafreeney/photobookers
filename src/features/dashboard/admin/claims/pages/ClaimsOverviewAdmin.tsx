import ClaimsTable from "../components/ClaimsTable";
import AppLayout from "../../../../../components/layouts/AppLayout";
import NavTabs from "../../components/NavTabs";
import SectionTitle from "../../../../../components/app/SectionTitle";
import { AuthUser } from "../../../../../../types";

type Props = {
  user: AuthUser;
  currentPath: string;
};

const ClaimsOverviewAdmin = ({ user, currentPath }: Props) => {
  return (
    <AppLayout title="Admin Dashboard" user={user} currentPath={currentPath}>
      <NavTabs currentPath="/dashboard/admin/claims" />
      <div class="flex flex-col gap-4">
        <SectionTitle>Claims Pending Admin Review</SectionTitle>
        <ClaimsTable />
      </div>
    </AppLayout>
  );
};
export default ClaimsOverviewAdmin;
