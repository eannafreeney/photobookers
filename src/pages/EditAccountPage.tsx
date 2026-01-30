import { AuthUser } from "../../types";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";

const EditAccountPage = ({ user }: { user: AuthUser }) => {
  return (
    <AppLayout title="Edit Account" user={user}>
      <Page>
        <h1>Edit Account</h1>
      </Page>
    </AppLayout>
  );
};
export default EditAccountPage;
