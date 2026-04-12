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
import { CreatorStatus } from "../../../db/schema";
import NavTabs from "../../../features/dashboard/books/components/NavTabs";

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

  const [error, result] =
    creatorType === "artist"
      ? await getBooksByArtistId(creatorId, currentPage, searchQuery)
      : await getBooksByPublisherId(creatorId, currentPage, searchQuery);

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
      <VerificationStatusBanner creatorStatus={user.creator.status ?? "stub"} />
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
  creatorStatus: CreatorStatus;
};

const VerificationStatusBanner = ({
  creatorStatus,
}: VerificationStatusProps) => {
  if (creatorStatus === "verified") return <></>;

  return (
    <div class="relative flex border-outline bg-surface-alt p-4 text-on-surface dark:border-outline-dark dark:bg-surface-dark-alt dark:text-on-surface-dark border-b">
      <div class="mx-auto flex flex-wrap items-center gap-2 px-6">
        <p class="sm:text-sm text-pretty text-xs">
          Your creator profile is pending verification. You can edit books, but
          publishing is disabled until verification.
        </p>
        <form method="post" action="/auth/resend-verification" x-target="toast">
          <Button variant="solid" color="warning">
            Resend verification email
          </Button>
        </form>
      </div>
    </div>
  );
};
