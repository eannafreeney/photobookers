import { AuthUser } from "../../../../../../types";
import Link from "../../../../../components/app/Link";
import Table from "../../../../../components/app/Table";
import FormDelete from "../../../../../components/forms/FormDelete";
import { deleteIcon, editIcon } from "../../../../../lib/icons";
import { formatDate } from "../../../../../utils";
import { getAllFairsAdmin } from "../services";
import FairStatusBadge from "./FairStatusBadge";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import StatusPill from "../../components/StatusPill";
import { deleteRowAttrs } from "@/lib/utils";

type Props = {
  status?: "draft" | "published" | "cancelled" | undefined;
  currentPage: number;
  searchQuery?: string;
  currentPath: string;
  user: AuthUser | null;
};

const AdminFairsTableAndFilter = async ({
  status = undefined,
  currentPage,
  searchQuery,
  currentPath,
  user,
}: Props) => {
  const [error, result] = await getAllFairsAdmin(
    currentPage,
    searchQuery,
    status,
  );

  if (error) return <div>{error.reason}</div>;

  const { fairs, totalPages, page } = result;

  const targetId = "fairs-table-body";

  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@fairs:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/fairs', { target: 'fairs-table-container' })`,
  };

  return (
    <div x-data>
      <div
        id="fairs-table-container"
        class="flex flex-col gap-4"
        x-ref="paginationContent"
      >
        <Table id="fairs-table">
          <Table.Head>
            <tr>
              <Table.HeadRow>Name</Table.HeadRow>
              <Table.HeadRow>Dates</Table.HeadRow>
              <Table.HeadRow>Location</Table.HeadRow>
              <Table.HeadRow>Status</Table.HeadRow>
              <Table.HeadRow>Approval</Table.HeadRow>
              <Table.HeadRow>Actions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} {...tableBodyAttrs} xMerge="append">
            {fairs.map((fair) => (
              <tr key={fair.id} x-data>
                <Table.BodyRow>
                  <Link href={`/dashboard/admin/fairs/${fair.id}`}>
                    <span class="font-medium">{fair.name}</span>
                  </Link>
                </Table.BodyRow>
                <Table.BodyRow>
                  <div class="text-sm">
                    {formatDate(fair.startDate)} - {formatDate(fair.endDate)}
                  </div>
                </Table.BodyRow>
                <Table.BodyRow>
                  <div class="text-sm">
                    {fair.city && fair.country
                      ? `${fair.city}, ${fair.country}`
                      : fair.city || fair.country || "-"}
                  </div>
                </Table.BodyRow>
                <Table.BodyRow>
                  <FairStatusBadge status={fair.status} />
                </Table.BodyRow>
                <Table.BodyRow>
                  <StatusPill status={fair.approvalStatus} />
                </Table.BodyRow>
                <Table.BodyRow>
                  <div class="flex gap-2">
                    <Link
                      href={`/dashboard/admin/fairs/${fair.id}`}
                      title="Edit"
                    >
                      {editIcon()}
                    </Link>
                    <FormDelete
                      action={`/dashboard/admin/fairs/${fair.id}`}
                      {...deleteRowAttrs}
                    >
                      <button
                        type="submit"
                        class="cursor-pointer hover:text-red-500"
                      >
                        {deleteIcon}
                      </button>
                    </FormDelete>
                  </div>
                </Table.BodyRow>
              </tr>
            ))}
          </Table.Body>
        </Table>
        <InfiniteScroll
          baseUrl={currentPath}
          page={page}
          totalPages={totalPages}
          targetId={targetId}
        />
      </div>
    </div>
  );
};

export default AdminFairsTableAndFilter;
