import { AuthUser } from "../../../../../../types";
import { Creator } from "../../../../../db/schema";
import Page from "../../../../../components/layouts/Page";
import CreatorImageForm from "../../../images/forms/CreatorCoverForm";
import AppLayout from "../../../../../components/layouts/AppLayout";
import Breadcrumbs from "../../components/Breadcrumbs";
import EditCreatorFormAdmin from "../forms/EditCreatorFormAdmin";
import FeatureGuard from "../../../../../components/layouts/FeatureGuard";
import { getBooksByCreatorId } from "../services";
import InfoPage from "../../../../../pages/InfoPage";
import { useUser } from "../../../../../contexts/UserContext";
import Table from "../../../../../components/app/Table";
import { Pagination } from "../../../../../components/app/Pagination";
import Button from "../../../../../components/app/Button";
import DeleteFormButton from "../../components/DeleteFormButton";
import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import Link from "../../../../../components/app/Link";
import { getFormValues } from "../utils";

type Props = {
  user: AuthUser;
  creator: Creator;
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
};

const EditCreatorPageAdmin = ({
  user,
  creator,
  currentPath,
  currentPage,
  searchQuery,
}: Props) => {
  const formValues = getFormValues(creator);

  return (
    <AppLayout
      title="Edit Creator Profile"
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs
          items={[
            {
              label: `Admin Creators Overview`,
              href: "/dashboard/admin/creators",
            },
            {
              label: `Edit ${creator.displayName}`,
            },
          ]}
        />
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div class="md:w-1/3">
            <CreatorImageForm
              initialUrl={creator?.coverUrl ?? null}
              creator={creator}
              user={user}
            />
          </div>
          <div
            class="hidden md:block w-px shrink-0 bg-outline self-stretch"
            aria-hidden="true"
          />
          <hr class="my-4 md:hidden" />
          <div class="md:w-2/3">
            <EditCreatorFormAdmin
              formValues={formValues}
              creatorId={creator?.id}
              type={creator?.type}
            />
          </div>
        </div>
        <CreatorBookList
          creatorId={creator.id}
          currentPath={currentPath}
          currentPage={currentPage}
          searchQuery={searchQuery}
        />
        <FeatureGuard flagName="messages">
          {/* <CreatorMessageList creatorId={creator.id} /> */}
        </FeatureGuard>
      </Page>
    </AppLayout>
  );
};

export default EditCreatorPageAdmin;

type CreatorBookListProps = {
  creatorId: string;
  currentPath: string;
  currentPage: number;
  searchQuery?: string;
};

const CreatorBookList = async ({
  creatorId,
  currentPath,
  currentPage,
  searchQuery,
}: CreatorBookListProps) => {
  const user = useUser();
  const [error, result] = await getBooksByCreatorId(
    creatorId,
    currentPage,
    searchQuery,
  );
  if (error) return <InfoPage errorMessage={error.reason} user={user} />;

  const targetId = "creator-books-table-body";

  const { books, totalPages, page } = result;

  return (
    <div class="flex flex-col gap-4">
      <SectionTitle>Books</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="creator-books-table"
          action={`/dashboard/admin/creators/${creatorId}/update`}
          placeholder="Filter books..."
        />
        <Link href="/dashboard/admin/books/create">
          <Button variant="solid" color="primary">
            New Book
          </Button>
        </Link>
      </div>
      <Table id="creator-books-table">
        <Table.Head>
          <Table.HeadRow>Cover</Table.HeadRow>
          <Table.HeadRow>Title</Table.HeadRow>
          <Table.HeadRow>Artist</Table.HeadRow>
          <Table.HeadRow>Publisher</Table.HeadRow>
        </Table.Head>
        <Table.Body id={targetId}>
          {books.map((book) => (
            <tr>
              <Table.BodyRow>
                <img
                  src={book.coverUrl ?? ""}
                  alt={book.title}
                  class="w-auto h-12"
                />
              </Table.BodyRow>
              <Table.BodyRow>{book.title}</Table.BodyRow>
              <Table.BodyRow>{book.artist?.displayName}</Table.BodyRow>
              <Table.BodyRow>{book.publisher?.displayName}</Table.BodyRow>
              <Table.BodyRow>
                <a href={`/dashboard/admin/books/${book.id}/update`}>
                  <Button variant="outline" color="inverse">
                    <span>Edit</span>
                  </Button>
                </a>
              </Table.BodyRow>
              <Table.BodyRow>
                <DeleteFormButton
                  action={`/dashboard/admin/books/${book.id}/delete`}
                />
              </Table.BodyRow>
            </tr>
          ))}
        </Table.Body>
      </Table>
      <Pagination
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </div>
  );
};
