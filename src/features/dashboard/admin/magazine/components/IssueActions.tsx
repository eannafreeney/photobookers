import { MagazineIssueView } from "@/domain/magazine/queries";
import PublishMagazineIssueToggle from "./PublishToggle";
import FormPost from "@/components/forms/FormPost";
import Button from "@/components/app/Button";
import FormDelete from "@/components/forms/FormDelete";

type Props = {
  issue: MagazineIssueView;
  action: string;
  nextNumber: number;
};

const IssueActions = ({ issue, action, nextNumber }: Props) => (
  <div class="flex flex-col gap-3 border border-on-surface-strong bg-surface-alt p-4">
    <span class="kicker text-accent">Actions</span>
    <div class="flex flex-wrap items-center justify-between gap-3">
      {issue.status === "draft" ? (
        <form method="post" action={`${action}/approve`}>
          <button
            type="submit"
            class="border border-[#4f7a4a] px-3 py-1.5 text-sm font-semibold text-[#4f7a4a] hover:bg-[#4f7a4a]/10"
          >
            ✓ Approve
          </button>
        </form>
      ) : null}

      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-on-surface">Published</span>
        <PublishMagazineIssueToggle
          issueId={issue.id}
          isPublished={issue.status === "published"}
          redirect={action}
        />
      </div>

      <PublishIssueButton issue={issue} nextNumber={nextNumber} />

      <DeleteIssueButton issueId={issue.id} />
    </div>
    {issue.status !== "published" ? (
      <p class="text-xs text-on-surface-weak">
        Drafts are hidden from the public site. Approve, then publish with a
        number to make it live (still behind the magazine feature flag).
      </p>
    ) : null}
  </div>
);

export default IssueActions;

type PublishIssueButtonProps = {
  issue: MagazineIssueView;
  nextNumber: number;
};

const PublishIssueButton = ({ issue, nextNumber }: PublishIssueButtonProps) => {
  const action = `/dashboard/admin/magazine/${issue.id}`;

  return (
    <FormPost action={`${action}/number`} className="flex items-center gap-2">
      <label class="text-sm text-on-surface">Issue #</label>
      <input
        type="number"
        name="issueNumber"
        min={1}
        value={String(issue.issueNumber ?? nextNumber)}
        class="w-20 border border-outline bg-surface px-2 py-1.5 text-sm tabular-nums text-on-surface"
      />
      <Button variant="outline" color="primary">
        Publish
      </Button>
    </FormPost>
  );
};

type DeleteIssueButtonProps = {
  issueId: string;
};

const DeleteIssueButton = ({ issueId }: DeleteIssueButtonProps) => {
  const action = `/dashboard/admin/magazine/${issueId}`;

  const alpineAttrs = {
    "x-target": "toast",
    "@ajax:before": "confirm('Are you sure?') || $event.preventDefault()",
  };

  return (
    <FormDelete action={`${action}/delete`} {...alpineAttrs}>
      <Button variant="outline" color="danger">
        Delete
      </Button>
    </FormDelete>
  );
};
