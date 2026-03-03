import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/app/TableSearch";
import Link from "../../../../../components/app/Link";
import Button from "../../../../../components/app/Button";
import Table from "../../../../../components/app/Table";
import CopyCellCol from "../../../../../components/app/CopyCellCol";
import DeleteFormButton from "../../components/DeleteFormButton";
import { User } from "../../../../../db/schema";
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
    <div id="users-table-container" class="flex flex-col gap-4">
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
            <Table.HeadRow>Name</Table.HeadRow>
            <Table.HeadRow>Email</Table.HeadRow>
            <Table.HeadRow>Creator Profile</Table.HeadRow>
            <Table.HeadRow>Creator Status</Table.HeadRow>
            <Table.HeadRow>ID</Table.HeadRow>
          </tr>
        </Table.Head>
        <Table.Body id="users-table-body" {...alpineAttrs}>
          {users.map((user) => (
            <UserTableRow key={user.id} user={user} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default UsersTableAdmin;

type RowProps = {
  user: User | null;
};

const UserTableRow = ({ user }: RowProps) => {
  if (!user) {
    return <></>;
  }

  return (
    <tr>
      <Table.BodyRow>
        {user.firstName} {user.lastName}
      </Table.BodyRow>
      <Table.BodyRow>{user.email}</Table.BodyRow>
      <Table.BodyRow>
        <CreatorName userId={user.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        <CreatorStatus userId={user.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        <CopyCellCol entity={user.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        <a
          href={`/dashboard/admin/users/generate-magic-link/${user.id}`}
          x-target="modal-root"
        >
          <Button variant="outline" color="inverse">
            <span>Generate Magic Link</span>
          </Button>
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <DeleteFormButton action={`/dashboard/admin/users/${user.id}`} />
      </Table.BodyRow>
    </tr>
  );
};

const CreatorName = async ({ userId }: { userId: string }) => {
  const creator = await getCreatorByOwnerUserId(userId);
  if (!creator) return <></>;
  return (
    <Link href={`/creators/${creator.slug}`} target="_blank">
      {creator.displayName}
    </Link>
  );
};

const CreatorStatus = async ({ userId }: { userId: string }) => {
  const creator = await getCreatorByOwnerUserId(userId);
  if (!creator) return <></>;
  return (
    <Link href={`/creators/${creator.slug}`} target="_blank">
      <Badge>{capitalize(creator.status ?? "")}</Badge>
    </Link>
  );
};
