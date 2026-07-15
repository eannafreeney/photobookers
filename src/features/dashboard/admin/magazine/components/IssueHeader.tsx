import Link from "@/components/app/Link";
import { MagazineIssueView } from "@/domain/magazine/queries";
import StatusPill from "../../components/StatusPill";

type Props = {
  issue: MagazineIssueView;
};

const IssueHeader = ({ issue }: Props) => {
  return (
    <div class="flex flex-col gap-2">
      <Link
        href="/dashboard/admin/magazine"
        className="text-xs font-medium text-on-surface hover:text-accent"
      >
        ← All issues
      </Link>
      <div class="flex flex-wrap items-center gap-3">
        <StatusPill status={issue.status} />
        {issue.issueNumber ? (
          <span class="text-sm font-semibold text-on-surface">
            Issue {issue.issueNumber}
          </span>
        ) : null}
        <Link
          href={`/dashboard/admin/magazine/${issue.id}/preview`}
          target="_blank"
          className="text-xs font-medium text-accent hover:underline"
        >
          Preview →
        </Link>
        {issue.status === "published" ? (
          <Link
            href={`/magazine/${issue.slug}`}
            target="_blank"
            className="text-xs font-medium text-accent hover:underline"
          >
            View live →
          </Link>
        ) : null}
      </div>
      <h1 class="font-display text-3xl font-medium text-on-surface-strong">
        {issue.title}
      </h1>
      {issue.subtitle ? <p class="text-on-surface">{issue.subtitle}</p> : null}
      {issue.theme ? (
        <p class="text-sm italic text-on-surface-weak">{issue.theme}</p>
      ) : null}
    </div>
  );
};

export default IssueHeader;
