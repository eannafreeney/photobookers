import { BookForm } from "../forms/BookForm";
import { AuthUser } from "../../../../../types";
import SectionTitle from "../../../../components/app/SectionTitle";
import Page from "../../../../components/layouts/Page";
import AppLayout from "../../../../components/layouts/AppLayout";
import Breadcrumbs from "../../admin/components/Breadcrumbs";

type AddNewBookPageProps = {
  user: AuthUser;
  currentPath: string;
};

const AddNewBookPage = ({ user, currentPath }: AddNewBookPageProps) => {
  const isPublisher = user.creator?.type === "publisher";

  const action = isPublisher
    ? "/dashboard/books/new/publisher"
    : "/dashboard/books/new/artist";

  return (
    <AppLayout title="Add Book" user={user} currentPath={currentPath}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard/books" },
            {
              label: `Create Book`,
            },
          ]}
        />
        <BookForm action={action} isPublisher={isPublisher} />
      </Page>
    </AppLayout>
  );
};

export default AddNewBookPage;
