import { getAllUsers } from "../../../../../services/users";
import SectionTitle from "../../../../../components/app/SectionTitle";
import TableSearch from "../../../../../components/cms/ui/TableSearch";
import Link from "../../../../../components/app/Link";
import Button from "../../../../../components/app/Button";
import Table from "../../../../../components/cms/ui/Table";
import CopyCellCol from "../../../../../components/admin/CopyCellCol";
import { AuthUser } from "../../../../../../types";
import DeleteFormButton from "../../components/DeleteFormButton";
import { User } from "../../../../../db/schema";

const UsersTableAdmin = async () => {
  const users = await getAllUsers();

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
            <th class="p-4">Name</th>
            <th class="p-4">Email</th>
            <th class="p-4">ID</th>
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
      <td class="p-4">
        {user.firstName} {user.lastName}
      </td>
      <td class="p-4">{user.email}</td>
      <td>
        <CopyCellCol entity={user.id} />
      </td>
      <td class="p-4">
        <a href={`/dashboard/admin/users/edit/${user.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </td>

      <td class="p-4">
        <a
          href={`/dashboard/admin/users/generate-magic-link/${user.id}`}
          x-target="modal-root"
        >
          <Button variant="outline" color="inverse">
            <span>Generate Magic Link</span>
          </Button>
        </a>
      </td>
      <td class="p-4">
        <DeleteFormButton action={`/dashboard/admin/users/${user.id}`} />
      </td>
    </tr>
  );
};
