import { Creator } from "../../db/schema";
import { getAllCreatorProfilesAdmin } from "../../services/admin";
import { capitalize, formatDate } from "../../utils";
import Button from "../app/Button";
import Link from "../app/Link";
import SectionTitle from "../app/SectionTitle";
import Table from "../cms/ui/Table";
import TableSearch from "../cms/ui/TableSearch";
import CopyCellCol from "./CopyCellCol";
import DeleteFormButton from "./DeleteFormButton";

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
