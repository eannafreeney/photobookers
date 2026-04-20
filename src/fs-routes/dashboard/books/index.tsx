import { createRoute } from "hono-fsr";
import { Context } from "hono";
import {
  getBooksByArtistId,
  getBooksByPublisherId,
} from "../../../features/dashboard/books/services";
import { getUser } from "../../../utils";
import { getFlash } from "../../../utils";
import { getIsMobile } from "../../../lib/device";
import InfoPage from "../../../pages/InfoPage";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import { BooksOverviewTable } from "../../../features/dashboard/books/tables/BooksOverviewTable";
import Button from "../../../components/app/Button";
import { CreatorClaimStatus, CreatorStatus } from "../../../db/schema";
import NavTabs from "../../../features/dashboard/books/components/NavTabs";
import { getPendingClaim } from "../../../features/claims/services";
import Banner from "../../../components/app/Banner";
import FormPost from "../../../components/forms/FormPost";

export const GET = createRoute(async (c: Context) => {
  const searchQuery = c.req.query("search");
  const user = await getUser(c);
  const flash = await getFlash(c);
  const isMobile = getIsMobile(c.req.header("user-agent") ?? "");
  const currentPage = parseInt(c.req.query("page") ?? "1");
  const currentPath = c.req.path;

  if (!user.creator)
    return c.html(<InfoPage errorMessage="Creator not found" />);

  const creatorId = user.creator.id;
  const creatorType = user.creator.type;

  const booksByCreator =
    creatorType === "artist"
      ? getBooksByArtistId(creatorId, currentPage, searchQuery)
      : getBooksByPublisherId(creatorId, currentPage, searchQuery);

  const [[claimError, claim], [error, result]] = await Promise.all([
    getPendingClaim(user.id, creatorId),
    booksByCreator,
  ]);
  if (claimError)
    return c.html(<InfoPage errorMessage={claimError.reason} user={user} />);

  if (error)
    return c.html(<InfoPage errorMessage={error.reason} user={user} />);

  const { books, totalPages, page } = result;

  return c.html(
    <AppLayout
      title="Books Overview"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <VerificationStatusBanner
        claimStatus={claim?.status}
        creatorStatus={user.creator.status ?? "stub"}
      />
      <Page>
        <Breadcrumbs
          items={[
            { label: "Dashboard" },
            { label: "Books", href: "/dashboard/books" },
          ]}
        />
        <NavTabs currentPath={currentPath} />
        <div class="flex flex-col gap-16">
          <BooksOverviewTable
            books={books}
            isMobile={isMobile}
            creator={user.creator}
            user={user}
            currentPath={currentPath}
            page={page}
            totalPages={totalPages}
          />
        </div>
      </Page>
    </AppLayout>,
  );
});

type VerificationStatusProps = {
  claimStatus: CreatorClaimStatus | null;
  creatorStatus: CreatorStatus | null;
};

const VerificationStatusBanner = ({
  claimStatus,
  creatorStatus,
}: VerificationStatusProps) => {
  if (creatorStatus === "verified") return <></>;

  if (claimStatus === "pending_admin_review") {
    return (
      <Banner
        type="info"
        message="Your creator profile is pending admin review. You can edit books, but publishing is disabled until admin review."
      />
    );
  }

  return (
    <Banner
      type="info"
      message="Your creator profile is pending verification. You can edit books, but publishing is disabled until verification."
    >
      <FormPost action="/auth/resend-verification" x-target="toast">
        <Button variant="solid" color="warning">
          Resend verification email
        </Button>
      </FormPost>
    </Banner>
  );
};
