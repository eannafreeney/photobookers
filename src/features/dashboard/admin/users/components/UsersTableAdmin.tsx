import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import Link from "../../../../../components/app/Link";
import Button from "../../../../../components/app/Button";
import Table from "../../../../../components/app/Table";
import DeleteFormButton from "../../components/DeleteFormButton";
import { getAllUsersAdmin } from "../services";
import CreatorStatusBadge from "../../components/CreatorStatusBadge";
import { Pagination } from "../../../../../components/app/Pagination";
import { Creator, User } from "../../../../../db/schema";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";

type Props = {
  searchQuery?: string;
  currentPage: number;
  currentPath: string;
};

const UsersTableAdmin = async ({
  searchQuery,
  currentPage,
  currentPath,
}: Props) => {
  const result = await getAllUsersAdmin(searchQuery, currentPage);

  if (!result?.users) {
    return <div>No users found</div>;
  }

  const { users, totalPages, page } = result;

  const targetId = "users-table-body";

  const alpineAttrs = {
    "x-init": "true",
    "@users:updated.window":
      "$ajax('/dashboard/admin/users', { target: 'users-table-container' })",
  };

  return (
    <div
      x-data="{ selectedCount: 0 }"
      id="users-table-container"
      class="flex flex-col gap-4"
    >
      <SectionTitle>Users</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="users-table"
          action="/dashboard/admin/users"
          placeholder="Filter users..."
        />
        <Link href="/dashboard/users/new">
          <Button variant="solid" color="primary">
            New
          </Button>
        </Link>
      </div>
      <Table id="users-table">
        <Table.Head>
          <tr>
            <Table.HeadRow> </Table.HeadRow>
            <Table.HeadRow>Name</Table.HeadRow>
            <Table.HeadRow>Email</Table.HeadRow>
            <Table.HeadRow>Creator Profile</Table.HeadRow>
            <Table.HeadRow>Creator Status</Table.HeadRow>
          </tr>
        </Table.Head>
        <Table.Body id={targetId} {...alpineAttrs} xMerge="append">
          {users.map((user) => (
            <UserTableRow key={user.id} user={user} />
          ))}
        </Table.Body>
      </Table>
      <InfiniteScroll
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
      <DeleteMultipleUsersForm />
    </div>
  );
};

export default UsersTableAdmin;

type UserRow = Awaited<ReturnType<typeof getAllUsersAdmin>>["users"][number];

type RowProps = {
  user: UserRow;
};

const UserTableRow = ({ user }: RowProps) => {
  if (!user) return <></>;

  return (
    <tr>
      <Table.BodyRow>
        <input
          type="checkbox"
          form="users-table-form"
          name="ids"
          value={user.id}
          class="cursor-pointer"
        />
      </Table.BodyRow>
      <Table.BodyRow>
        {user.firstName} {user.lastName}
      </Table.BodyRow>
      <Table.BodyRow>{user.email}</Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${user.creators[0]?.slug}`} target="_blank">
          {user.creators[0]?.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <Link href={`/creators/${user.creators[0]?.slug}`} target="_blank">
          {user.creators[0]?.status && (
            <CreatorStatusBadge creatorStatus={user.creators[0]?.status} />
          )}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <DeleteFormButton action={`/dashboard/admin/users/${user.id}/delete`} />
      </Table.BodyRow>
    </tr>
  );
};

const DeleteMultipleUsersForm = () => {
  const deleteAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <form
      x-ref="form"
      id="users-table-form"
      method="post"
      action="/dashboard/admin/users/delete-multiple"
      {...deleteAttrs}
    >
      <Button variant="outline" color="danger" type="submit">
        Delete
      </Button>
    </form>
  );
};
