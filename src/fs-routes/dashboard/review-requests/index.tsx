import { createRoute } from "hono-fsr";
import AppLayout from "../../../components/layouts/AppLayout";
import MemberDashboardShell from "../../../features/dashboard/components/MemberDashboardShell";
import PageHeader from "../../../components/app/PageHeader";
import Button from "../../../components/app/Button";
import FormPost from "../../../components/forms/FormPost";
import Link from "../../../components/app/Link";
import InfoPage from "../../../pages/InfoPage";
import { getFlash, getUser } from "../../../utils";
import { listIncomingReviewRequests } from "../../../domain/reviews/services";
import { canTransitionReviewRequest } from "../../../domain/reviews/policy";
import type { ReviewRequestStatus } from "../../../db/schema";

const ACTIONS: { status: ReviewRequestStatus; label: string }[] = [
  { status: "approved", label: "Approve" },
  { status: "declined", label: "Decline" },
  { status: "sent", label: "Mark sent" },
];

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!user.creator && !user.isAdmin) {
    return c.html(<InfoPage errorMessage="Creators manage review requests." user={user} />, 403);
  }
  const flash = await getFlash(c);
  const [error, requests] = await listIncomingReviewRequests(user.id, user.isAdmin);
  if (error) return c.html(<InfoPage errorMessage={error.reason} user={user} />);

  return c.html(
    <AppLayout title="Review requests" user={user} flash={flash} currentPath={c.req.path}>
      <MemberDashboardShell user={user} currentPath={c.req.path}>
        <PageHeader
          title="Review requests"
          intro="Approve a request, then mark it sent once you've posted the book. The reviewer publishes the piece on the site."
        />
        {requests.length === 0 ? (
          <p class="text-sm text-on-surface">No requests yet.</p>
        ) : (
          <ul class="flex flex-col gap-4">
            {requests.map((request) => (
              <li class="flex flex-col gap-2 border-b border-outline pb-4">
                <p class="text-on-surface-strong">
                  <Link href={`/books/${request.book.slug}`}>{request.book.title}</Link>
                  {" · "}
                  {request.user.reviewerProfile ? (
                    <Link href={`/reviewers/${request.user.reviewerProfile.slug}`}>
                      {request.user.reviewerProfile.displayName}
                    </Link>
                  ) : (
                    "Reviewer"
                  )}
                  {` · ${request.status}`}
                </p>
                {request.note ? (
                  <p class="text-sm text-on-surface">{request.note}</p>
                ) : null}
                <div class="flex flex-wrap gap-2">
                  {ACTIONS.filter((action) =>
                    canTransitionReviewRequest(request.status, action.status),
                  ).map((action) => (
                    <FormPost action={`/dashboard/review-requests/${request.id}`}>
                      <input type="hidden" name="status" value={action.status} />
                      <Button variant="outline" color="primary" width="fit">
                        {action.label}
                      </Button>
                    </FormPost>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        )}
      </MemberDashboardShell>
    </AppLayout>,
  );
});
