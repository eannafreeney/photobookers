import CreatorForm from "../../components/cms/forms/CreatorForm";
import { AuthUser } from "../../../types";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";

type Props = { user: AuthUser | null; type: "artist" | "publisher" };

const AddNewCreatorPage = ({ user, type }: Props) => {
  return (
    <AppLayout title="Create Profile" user={user}>
      <Page>
        <div class="py-4">
          <CreatorForm type={type} />
        </div>
      </Page>
    </AppLayout>
  );
};

export default AddNewCreatorPage;
