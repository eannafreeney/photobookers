import { createRoute } from "hono-fsr";
import AppLayout from "@/components/layouts/AppLayout";
import Page from "@/components/layouts/Page";
import MagazineIssuePage from "@/features/app/components/magazine/MagazineIssuePage";
import { paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import InfoPage from "@/pages/InfoPage";
import Link from "@/components/app/Link";
import { getUser } from "@/utils";

// Admin-only: render any issue (including drafts) through the real published
// template, so an editor can see how the issue will look before publishing.
export const GET = createRoute(paramValidator(idSchema), async (c) => {
  const user = await getUser(c);
  const id = c.req.valid("param").id;

  const [error, issue] = await getIssueByIdForAdmin(id);
  if (error)
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);
  if (!issue) {
    return c.html(<InfoPage errorMessage="Issue not found" user={user} />, 404);
  }

  return c.html(
    <AppLayout
      title={`Preview — ${issue.title}`}
      currentPath={c.req.path}
      user={user}
    >
      <div class="flex flex-wrap items-center justify-between gap-2 border-b border-outline bg-surface-alt px-4 py-2 text-xs">
        <span class="font-semibold uppercase tracking-wider text-accent">
          Preview · {issue.status}
        </span>
        <span class="text-on-surface-weak">
          How this issue will look when published.
        </span>
        <Link
          href={`/dashboard/admin/magazine/${issue.id}`}
          className="font-medium text-on-surface hover:text-accent"
        >
          ← Back to editor
        </Link>
      </div>
      <Page>
        <MagazineIssuePage issue={issue} />
      </Page>
    </AppLayout>,
  );
});
