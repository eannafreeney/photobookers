import { AuthUser } from "../../../types";
import SectionTitle from "../../components/app/SectionTitle";
import AppLayout from "../../components/layouts/AppLayout";
import ClaimsTable from "../../components/admin/ClaimsTable";

type Props = {
  user: AuthUser;
};

const AdminDashboard = ({ user }: Props) => {
  return (
    <AppLayout title="Admin Dashboard" user={user}>
      <SectionTitle>Claims Pending Admin Review</SectionTitle>
      <ClaimsTable />
    </AppLayout>
  );
};
export default AdminDashboard;
