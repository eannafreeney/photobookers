import { AuthUser } from "../../../../../../types";
import Link from "../../../../../components/app/Link";
import Table from "../../../../../components/app/Table";
import FormDelete from "../../../../../components/forms/FormDelete";
import { deleteIcon, editIcon } from "../../../../../lib/icons";
import { getAllStoresAdmin } from "../services";
import StoreStatusBadge from "./StoreStatusBadge";
import StoreApprovalStatusPill from "./StoreApprovalStatusPill";
import { InfiniteScroll } from "../../../../../components/app/InfiniteScroll";
import DeleteStoreButton from "./DeleteStoreButton";

type Props = {
  currentPage: number;
  searchQuery?: string;
  currentPath: string;
  user: AuthUser | null;
};

const AdminStoresTableAndFilter = async ({
  currentPage,
  searchQuery,
  currentPath,
}: Props) => {
  const [error, result] = await getAllStoresAdmin(currentPage, searchQuery);

  if (error) return <div>{error.reason}</div>;

  const { stores, totalPages, page } = result;
  const targetId = "stores-table-body";

  const tableBodyAttrs = {
    "x-init": "true",
    "@ajax:before": "$dispatch('dialog:open')",
    "@stores:updated.window": `$dispatch('dialog:close'); $ajax('/dashboard/admin/stores', { target: 'stores-table-container' })`,
  };

  return (
    <div x-data>
      <div
        id="stores-table-container"
        class="flex flex-col gap-4"
        x-ref="paginationContent"
      >
        <Table id="stores-table">
          <Table.Head>
            <tr>
              <Table.HeadRow>Name</Table.HeadRow>
              <Table.HeadRow>Location</Table.HeadRow>
              <Table.HeadRow>Status</Table.HeadRow>
              <Table.HeadRow>Approval</Table.HeadRow>
              <Table.HeadRow>Actions</Table.HeadRow>
            </tr>
          </Table.Head>
          <Table.Body id={targetId} {...tableBodyAttrs} xMerge="append">
            {stores.map((store) => (
              <tr key={store.id} x-data>
                <Table.BodyRow>
                  <Link href={`/dashboard/admin/stores/${store.id}`}>
                    <span class="font-medium">{store.name}</span>
                  </Link>
                </Table.BodyRow>
                <Table.BodyRow>
                  <div class="text-sm">
                    {store.city}, {store.country}
                  </div>
                  <div class="text-xs text-on-surface-weak">
                    {store.address}
                  </div>
                </Table.BodyRow>
                <Table.BodyRow>
                  <StoreStatusBadge status={store.status} />
                </Table.BodyRow>
                <Table.BodyRow>
                  <StoreApprovalStatusPill
                    approvalStatus={store.approvalStatus}
                  />
                </Table.BodyRow>
                <Table.BodyRow>
                  <div class="flex gap-2">
                    <Link
                      href={`/dashboard/admin/stores/${store.id}`}
                      title="Edit"
                    >
                      {editIcon()}
                    </Link>
                    <DeleteStoreButton store={store} />
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

export default AdminStoresTableAndFilter;
