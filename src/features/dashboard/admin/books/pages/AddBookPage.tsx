import { AuthUser } from "../../../../../../types";
import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import NavTabs from "../../components/NavTabs";
import { BookFormAdmin } from "../components/AddBookForm";

type Props = {
  user: AuthUser;
  currentPath: string;
};

const AddBookPage = ({ user, currentPath }: Props) => {
  return (
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/books" />
        <BookFormAdmin />
      </Page>
    </AppLayout>
  );
};
export default AddBookPage;
