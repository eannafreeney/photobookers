import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import Link from "../../../../../components/app/Link";
import Button from "../../../../../components/app/Button";
import Table from "../../../../../components/app/Table";
import DeleteFormButton from "../../components/DeleteFormButton";
import { Creator, User } from "../../../../../db/schema";
import { getAllUsersAdmin, getCreatorByOwnerUserId } from "../services";
import Badge from "../../../../../components/app/Badge";
import { capitalize } from "../../../../../utils";

const UsersTableAdmin = async () => {
  const users = await getAllUsersAdmin();

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
        <Table.Body id="users-table-body" {...alpineAttrs}>
          {users.map((user) => (
            <UserTableRow key={user.id} user={user} />
          ))}
        </Table.Body>
      </Table>
      <DeleteMultipleUsersForm />
    </div>
  );
};

export default UsersTableAdmin;

type UserRow = Awaited<ReturnType<typeof getAllUsersAdmin>>[number];

type RowProps = {
  user: UserRow;
};

const UserTableRow = ({ user }: RowProps) => {
  if (!user) return <></>;

  console.log("user", user);

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
          <Badge>{capitalize(user.creators[0]?.status ?? "") ?? null}</Badge>
        </Link>
      </Table.BodyRow>
      {/* <Table.BodyRow>
        <CopyCellCol entity={user.id} />
      </Table.BodyRow>*/}
      {/* <Table.BodyRow>
        <a
          href={`/dashboard/admin/users/${user.id}/generate-magic-link`}
          x-target="modal-root"
        >
          <Button variant="outline" color="inverse">
            <span>Generate Magic Link</span>
          </Button>
        </a>
      </Table.BodyRow> */}
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
