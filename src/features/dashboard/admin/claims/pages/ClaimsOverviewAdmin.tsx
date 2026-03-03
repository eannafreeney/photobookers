import ClaimsTable from "../components/ClaimsTable";
import AppLayout from "../../../../../components/layouts/AppLayout";
import NavTabs from "../../components/NavTabs";
import SectionTitle from "../../../../../components/app/SectionTitle";
import { AuthUser } from "../../../../../../types";

type Props = {
  user: AuthUser;
};

const ClaimsOverviewAdmin = ({ user }: Props) => {
  return (
    <AppLayout title="Admin Dashboard" user={user}>
      <NavTabs currentPath="/dashboard/admin/books" />
      <SectionTitle>Claims Pending Admin Review</SectionTitle>
      <ClaimsTable />
    </AppLayout>
  );
};
export default ClaimsOverviewAdmin;
