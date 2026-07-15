import { AdminIssueListItem } from "@/domain/magazine/queries";
import Table from "@/components/app/Table";
import StatusPill from "../../components/StatusPill";
import PublishMagazineIssueToggle from "./PublishToggle";
import Link from "@/components/app/Link";
import FormDelete from "@/components/forms/FormDelete";
import { deleteIcon, editIcon } from "@/lib/icons";
import { deleteRowAttrs } from "@/lib/utils";

type Props = {
  issues: AdminIssueListItem[];
};

const MagazineTable = ({ issues }: Props) => {
  if (issues.length === 0) {
    return (
      <p class="border-t border-outline pt-6 text-sm text-on-surface">
        No issues yet. Generate your first draft above.
      </p>
    );
  }

  return (
    <Table id="magazine-issues-table">
      <Table.Head>
        <tr>
          <Table.HeadRow>#</Table.HeadRow>
          <Table.HeadRow>Status</Table.HeadRow>
          <Table.HeadRow>Title</Table.HeadRow>
          <Table.HeadRow>Theme</Table.HeadRow>
          <Table.HeadRow>Books</Table.HeadRow>
          <Table.HeadRow>Published</Table.HeadRow>
          <Table.HeadRow>Actions</Table.HeadRow>
        </tr>
      </Table.Head>
      <Table.Body>
        {issues.map((issue) => (
          <TableRow key={issue.id} issue={issue} />
        ))}
      </Table.Body>
    </Table>
  );
};

export default MagazineTable;

const TableRow = ({ issue }: { issue: AdminIssueListItem }) => {
  return (
    <tr>
      <Table.BodyRow>
        <span class="font-semibold text-on-surface-strong tabular-nums">
          {issue.issueNumber ?? "—"}
        </span>
      </Table.BodyRow>
      <Table.BodyRow>
        <StatusPill status={issue.status} />
      </Table.BodyRow>
      <Table.BodyRow>
        <Link
          href={`/dashboard/admin/magazine/${issue.id}`}
          className="font-display text-base font-medium text-on-surface-strong hover:text-accent no-underline"
        >
          {issue.title}
        </Link>
      </Table.BodyRow>
      <Table.BodyRow>
        <span class="line-clamp-1 max-w-88 text-on-surface">
          {issue.theme ?? "—"}
        </span>
      </Table.BodyRow>
      <Table.BodyRow>
        <span class="tabular-nums text-on-surface">{issue.bookCount}</span>
      </Table.BodyRow>
      <Table.BodyRow>
        <PublishMagazineIssueToggle
          issueId={issue.id}
          isPublished={issue.status === "published"}
          redirect="/dashboard/admin/magazine"
        />
      </Table.BodyRow>
      <Table.BodyRow>
        <div class="flex items-center gap-2">
          <Link href={`/dashboard/admin/magazine/${issue.id}`} target="_blank">
            <button class="cursor-pointer">{editIcon()}</button>
          </Link>

          <FormDelete
            action={`/dashboard/admin/magazine/${issue.id}/delete`}
            {...deleteRowAttrs}
          >
            <button type="submit" class="cursor-pointer hover:text-red-500">
              {deleteIcon}
            </button>
          </FormDelete>
        </div>
      </Table.BodyRow>
    </tr>
  );
};
