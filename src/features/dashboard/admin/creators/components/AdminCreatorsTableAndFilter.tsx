import Button from "../../../../../components/app/Button";
import Card from "../../../../../components/app/Card";
import CopyCellCol from "../../../../../components/app/CopyCellCol";
import Link from "../../../../../components/app/Link";
import { Pagination } from "../../../../../components/app/Pagination";
import Table from "../../../../../components/app/Table";
import { findFollowersCount } from "../../../../../db/queries";
import { Creator } from "../../../../../db/schema";
import { capitalize, formatDate } from "../../../../../utils";
import CreatorStatusBadge from "../../components/CreatorStatusBadge";
import DeleteFormButton from "../../components/DeleteFormButton";
import CreatorTypeForm from "../forms/CreatorTypeForm";
import {
  getAllCreatorProfilesByTypeAdmin,
  getUserByIdAdmin,
} from "../services";
import SendWelcomeEmailButton from "./SendWelcomeEmailButton";

type Props = {
  type?: "artist" | "publisher" | undefined;
  currentPage: number;
  searchQuery?: string;
  currentPath: string;
};

const AdminCreatorsTableAndFilter = async ({
  type = undefined,
  currentPage,
  searchQuery,
  currentPath,
}: Props) => {
  const result = await getAllCreatorProfilesByTypeAdmin(
    searchQuery,
    currentPage,
    type,
  );

  if (!result?.creators) {
    return <div>No creators found</div>;
  }

  const { creators, totalPages, page } = result;

  const targetId = "creators-table-body";

  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@creators:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/creators', { target: 'creators-table-container' })`,
  };

  return (
    <div x-data>
      <div
        id="creators-table-container"
        class="flex flex-col gap-4"
        x-ref="paginationContent"
      >
        <CreatorTypeForm type={type} />
        <Table id="creators-table">
          <Table.Head>
            <tr>
              <Table.HeadRow>Display Name</Table.HeadRow>
              <Table.HeadRow>ID</Table.HeadRow>
              <Table.HeadRow>Type</Table.HeadRow>
              <Table.HeadRow>Website</Table.HeadRow>
              <Table.HeadRow>Status</Table.HeadRow>
              <Table.HeadRow>Followers</Table.HeadRow>
              <Table.HeadRow>Created At</Table.HeadRow>
              <Table.HeadRow>Owner</Table.HeadRow>
              <Table.HeadRow>Actions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} {...tableBodyAttrs}>
            {creators.map((creator) => (
              <CreatorsTableRow creator={creator} />
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
    </div>
  );
};

export default AdminCreatorsTableAndFilter;

type CreatorsTableRowProps = {
  creator: Creator;
};

const CreatorsTableRow = ({ creator }: CreatorsTableRowProps) => {
  return (
    <tr>
      <Table.BodyRow>
        <Link href={`/creators/${creator.slug}`} target="_blank">
          {creator.displayName}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <CopyCellCol entity={creator.id} />
      </Table.BodyRow>
      <Table.BodyRow>{capitalize(creator.type)}</Table.BodyRow>
      <Table.BodyRow>
        <Link href={creator.website ?? ""} target="_blank">
          {creator.website}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <CreatorStatusBadge creatorStatus={creator.status ?? "stub"} />
      </Table.BodyRow>
      <Table.BodyRow>
        <FollowersCount creatorId={creator.id} />
      </Table.BodyRow>
      <Table.BodyRow>
        {formatDate(creator.createdAt ?? new Date())}
      </Table.BodyRow>
      <Table.BodyRow>
        <AssignOwnerCell
          ownerUserId={creator.ownerUserId}
          creatorId={creator.id}
        />
      </Table.BodyRow>
      <Table.BodyRow>
        <SendWelcomeEmailButton creator={creator} />
      </Table.BodyRow>
      <Table.BodyRow>
        <a href={`/dashboard/admin/creators/${creator.id}/update`}>
          <Button variant="outline" color="inverse">
            <span>Edit</span>
          </Button>
        </a>
      </Table.BodyRow>
      <Table.BodyRow>
        <DeleteFormButton
          action={`/dashboard/admin/creators/${creator.id}/delete`}
        />
      </Table.BodyRow>
    </tr>
  );
};

type AssignOwnerCellProps = {
  ownerUserId?: string | null;
  creatorId: string;
};

const AssignOwnerCell = async ({
  ownerUserId,
  creatorId,
}: AssignOwnerCellProps) => {
  // if not owned, assign owner button that opens a modal to assign an owner (user)
  if (ownerUserId) {
    const user = await getUserByIdAdmin(ownerUserId);
    return (
      <Link href={`/dashboard/admin/users/${ownerUserId}`}>
        {user?.email ?? "Unassigned"}
      </Link>
    );
  }

  return (
    <a
      href={`/dashboard/admin/creators/assign-owner/${creatorId}`}
      x-target="modal-root"
    >
      <Button variant="outline" color="inverse">
        <span>Assign Owner</span>
      </Button>
    </a>
  );
};

const FollowersCount = async ({ creatorId }: { creatorId: string }) => {
  const followerCount = await findFollowersCount(creatorId);
  return <Card.Text>{followerCount.toString() ?? "0"}</Card.Text>;
};
