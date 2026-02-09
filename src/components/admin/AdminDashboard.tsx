import { AuthUser } from "../../../types";
import SectionTitle from "../app/SectionTitle";
import AppLayout from "../layouts/AppLayout";
import ClaimsTable from "./ClaimsTable";

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
