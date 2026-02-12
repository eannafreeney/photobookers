import { Creator } from "../../db/schema";
import { getAllCreatorProfilesAdmin } from "../../services/admin";
import { capitalize, formatDate } from "../../utils";
import Button from "../app/Button";
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
      <td>{capitalize(creator.type)}</td>
      <td>
        <Link href={creator.website ?? ""} target="_blank">
          {creator.website}
        </Link>
      </td>
      <td>{capitalize(creator.status ?? "")}</td>
      <td>{formatDate(creator.createdAt ?? new Date())}</td>
      <td>
        <a href={`/dashboard/creators/edit/${creator.id}`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </td>
      <td>
        <form
          method="post"
          action={`/dashboard/admin/creators/delete/${creator.id}`}
          x-init
          {...{
            "@ajax:before":
              "confirm('Are you sure?') || $event.preventDefault()",
          }}
        >
          <Button variant="outline" color="danger">
            <span>Delete</span>
          </Button>
        </form>
      </td>
    </tr>
  );
};
