import Link from "@/components/app/Link";
import Table from "@/components/app/Table";
import { deleteIcon, editIcon } from "@/lib/icons";
import type { AdminIssueListItem } from "@/domain/magazine/queries";
import ThemeGenerator from "./ThemeGenerator";
import PublishMagazineIssueToggle from "./PublishToggle";
import StatusPill from "../../components/StatusPill";
import FormDelete from "@/components/forms/FormDelete";

type Props = {
  issues: AdminIssueListItem[];
};

const MagazineTable = ({ issues }: Props) => {
  const alpineAttrs = {
    "x-init": "true",
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
    "@ajax:success": "$el.closest('tr').remove()",
  };

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-col gap-1">
        <span class="kicker text-accent">Admin</span>
        <h1 class="font-display text-3xl font-medium text-on-surface-strong">
          Magazine
        </h1>
        <p class="text-sm text-on-surface">
          Generate a themed draft from the catalogue, prune it, then approve and
          assign it an issue number.
        </p>
      </div>

      <ThemeGenerator />

      {issues.length === 0 ? (
        <p class="border-t border-outline pt-6 text-sm text-on-surface">
          No issues yet. Generate your first draft above.
        </p>
      ) : (
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
                  <span class="tabular-nums text-on-surface">
                    {issue.bookCount}
                  </span>
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
                    <Link
                      href={`/dashboard/admin/magazine/${issue.id}`}
                      target="_blank"
                    >
                      <button class="cursor-pointer">{editIcon()}</button>
                    </Link>

                    <FormDelete
                      action={`/dashboard/admin/magazine/${issue.id}/delete`}
                      {...alpineAttrs}
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
      )}
    </div>
  );
};

export default MagazineTable;
