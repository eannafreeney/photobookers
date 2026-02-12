import { Creator } from "../../db/schema";
import { getAllCreatorProfilesAdmin } from "../../services/admin";
import { capitalize, formatDate } from "../../utils";
import Link from "../app/Link";
import Table from "../cms/ui/Table";

export const CreatorsTable = async () => {
  const creators = await getAllCreatorProfilesAdmin();

  return (
    <div class="flex flex-col gap-8">
      <Table id="creators-table">
        <Table.Head>
          <tr>
            <th>Display Name</th>
            <th>Type</th>
            <th>Website</th>
            <th>Status</th>
            <th>Created At</th>
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
      <td>{capitalize(creator.type)}</td>
      <td>
        <Link href={creator.website ?? ""} target="_blank">
          {creator.website}
        </Link>
      </td>
      <td>{capitalize(creator.status ?? "")}</td>
      <td>{formatDate(creator.createdAt ?? new Date())}</td>
    </tr>
  );
};
