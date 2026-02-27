import AppLayout from "../../components/layouts/AppLayout";
import NavTabs from "../../components/admin/NavTabs";
import SectionTitle from "../../components/app/SectionTitle";
import { AuthUser } from "../../../types";
import TableSearch from "../../components/cms/ui/TableSearch";
import Button from "../../components/app/Button";
import Link from "../../components/app/Link";
import Table from "../../components/cms/ui/Table";
import { formatDate } from "../../utils";
import { getAllUsers } from "../../services/users";
import CopyCellCol from "../../components/admin/CopyCellCol";
import Input from "../../components/cms/ui/Input";
import FormButtons from "../../components/cms/ui/FormButtons";
import Page from "../../components/layouts/Page";
import DeleteFormButton from "../../components/admin/DeleteFormButton";

type Props = {
  user: AuthUser;
  currentPath: string;
};

const UsersPage = ({ user, currentPath }: Props) => {
  return (
    <AppLayout title="Admin Dashboard" user={user}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <NewUserForm />
        <UsersTable />
      </Page>
    </AppLayout>
  );
};

export default UsersPage;

const NewUserForm = () => {
  const alpineAttrs = {
    "x-data": "newUserForm()",
    "x-target": "toast users-table-container new-user-form",
  };

  return (
    <div id="new-user-form" class="flex flex-col gap-4">
      <SectionTitle>New User</SectionTitle>
      <form
        action="/dashboard/admin/users/new"
        method="post"
        {...alpineAttrs}
        class="flex items-center justify-between gap-4"
      >
        <div class="flex-1 min-w-0">
          <Input
            label="Email"
            name="form.email"
            type="email"
            required
            validateInput="validateEmail()"
            showEmailAvailabilityChecker
          />
        </div>
        <div class="flex-1 min-w-0">
          <Input
            label="First Name"
            name="form.firstName"
            required
            validateInput="validateField('firstName')"
          />
        </div>
        <div class="flex-1 min-w-0">
          <Input
            label="Last Name"
            name="form.lastName"
            required
            validateInput="validateField('lastName')"
          />
        </div>
        <div class="flex-1 min-w-0">
          <Input
            label="Password"
            name="form.password"
            type="password"
            required
            validateInput="validateField('password')"
          />
        </div>
        <FormButtons buttonText="Create" loadingText="Creating..." />
      </form>
    </div>
  );
};

const UsersTable = async () => {
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
            <UserTableRow user={user} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

type RowProps = {
  user: AuthUser | null;
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
        <DeleteFormButton action={`/dashboard/admin/users/delete/${user.id}`} />
      </td>
    </tr>
  );
};
