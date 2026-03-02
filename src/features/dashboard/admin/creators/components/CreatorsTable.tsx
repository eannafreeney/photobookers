import { Creator } from "../../../../../db/schema";
import { getAllCreatorProfilesAdmin } from "../../../../../services/admin";
import { capitalize, formatDate } from "../../../../../utils";
import Button from "../../../../../components/app/Button";
import Link from "../../../../../components/app/Link";
import SectionTitle from "../../../../../components/app/SectionTitle";
import Table from "../../../../../components/cms/ui/Table";
import TableSearch from "../../../../../components/cms/ui/TableSearch";
import CopyCellCol from "../../../../../components/admin/CopyCellCol";
import DeleteFormButton from "../../components/DeleteFormButton";
import { getUserByIdAdmin } from "../services";

type Props = {
  searchQuery?: string;
};

export const CreatorsTable = async ({ searchQuery }: Props) => {
  const creators = await getAllCreatorProfilesAdmin(searchQuery);

  return (
    <div class="flex flex-col gap-8">
      <SectionTitle>Creators</SectionTitle>
      <div class="flex items-center justify-between gap-4">
        <TableSearch
          target="creators-table"
          action="/dashboard/admin/creators"
          placeholder="Filter creators..."
        />
      </div>
      <Table id="creators-table">
        <Table.Head>
          <tr>
            <th>Display Name</th>
            <th>ID</th>
            <th>Type</th>
            <th>Website</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Owner</th>
            <th>Actions</th>
          </tr>
        </Table.Head>
        <Table.Body id="creators-table-body">
          {creators.map((creator) => (
            <CreatorsTableRow creator={creator} />
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

type CreatorsTableRowProps = {
  creator: Creator;
};

const CreatorsTableRow = ({ creator }: CreatorsTableRowProps) => {
  return (
    <tr>
      <td>
        <Link href={`/creators/${creator.slug}`} target="_blank">
          {creator.displayName}
        </Link>
      </td>
      <td>
        <CopyCellCol entity={creator.id} />
      </td>
      <td>{capitalize(creator.type)}</td>
      <td>
        <Link href={creator.website ?? ""} target="_blank">
          {creator.website}
        </Link>
      </td>
      <td>{capitalize(creator.status ?? "")}</td>
      <td>{formatDate(creator.createdAt ?? new Date())}</td>
      <td>
        <AssignOwnerCell ownerUserId={creator.ownerUserId} />
      </td>
      <td>
        <a href={`/dashboard/admin/creators/edit/${creator.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td>
        <DeleteFormButton
          action={`/dashboard/admin/creators/delete/${creator.id}`}
        />
      </td>
    </tr>
  );
};

const AssignOwnerCell = async ({
  ownerUserId,
}: {
  ownerUserId?: string | null;
}) => {
  // if not owned, assign owner button that opens a modal to assign an owner (user)
  if (ownerUserId) {
    const user = await getUserByIdAdmin(ownerUserId);
    return (
      <Link href={`/dashboard/admin/users/edit/${ownerUserId}`}>
        {user?.email ?? "Unassigned"}
      </Link>
    );
  }

  return (
    <a
      href={`/dashboard/admin/creators/edit/assign-owner`}
      x-target="modal-root"
    >
      <Button variant="outline" color="inverse">
        <span>Assign Owner</span>
      </Button>
    </a>
  );
  // otherwise show the owner's email
};
