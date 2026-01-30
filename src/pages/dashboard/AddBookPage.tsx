import { BookForm } from "../../components/cms/forms/BookForm";
import { AuthUser } from "../../../types";
import SectionTitle from "../../components/app/SectionTitle";
import Page from "../../components/layouts/Page";
import AppLayout from "../../components/layouts/AppLayout";

type AddNewBookPageProps = {
  user: AuthUser;
};

const AddNewBookPage = ({ user }: AddNewBookPageProps) => {
  const isPublisher = user.creator?.type === "publisher";

  const action = isPublisher
    ? "/dashboard/books/new/publisher"
    : "/dashboard/books/new/artist";

  return (
    <AppLayout title="Add Book" user={user}>
      <Page>
        <div class="py-8">
          <SectionTitle>Create Book</SectionTitle>
          <BookForm action={action} isPublisher={isPublisher} />
        </div>
      </Page>
    </AppLayout>
  );
};

export default AddNewBookPage;
