import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../../pages/InfoPage";
import Alert from "../../../../components/app/Alert";
import { getFlash, getUser, setFlash } from "../../../../utils";
import BulkCoverUpload from "../../../../features/dashboard/books/import/components/BulkCoverUpload";
import { db } from "../../../../db/client";
import { books } from "../../../../db/schema";
import { and, eq, inArray } from "drizzle-orm";
import {
  matchCoversByFilename,
  type BookForMatching,
} from "../../../../features/dashboard/books/import/matchCovers";
import { removeInvalidImages } from "../../../../services/storage";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const flash = await getFlash(c);
  const currentPath = c.req.path;

  if (!user.creator) {
    return c.html(<InfoPage errorMessage="Creator not found" user={user} />);
  }

  const bookIdsParam = c.req.query("books");
  if (!bookIdsParam) {
    return c.html(
      <InfoPage
        errorMessage="No books specified for cover upload"
        user={user}
      />,
    );
  }

  const bookIds = bookIdsParam.split(",").filter(Boolean);
  if (bookIds.length === 0) {
    return c.html(<InfoPage errorMessage="No valid book IDs provided" user={user} />);
  }

  // Fetch books to pass to client for matching
  const creatorBooks = await db
    .select({
      id: books.id,
      title: books.title,
      slug: books.slug,
      coverUrl: books.coverUrl,
    })
    .from(books)
    .where(
      and(
        inArray(books.id, bookIds),
        user.creator.type === "artist"
          ? eq(books.artistId, user.creator.id)
          : eq(books.publisherId, user.creator.id),
      ),
    );

  return c.html(
    <AppLayout
      title="Upload Covers"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard/books" },
            { label: "Import CSV", href: "/dashboard/books/import" },
            { label: "Upload Covers" },
          ]}
        />
        <BulkCoverUpload bookIds={bookIds} books={creatorBooks} />
      </Page>
    </AppLayout>,
  );
});

function isCoverFile(file: unknown): file is File {
  return (
    !!file &&
    typeof file === "object" &&
    "arrayBuffer" in file &&
    "size" in file &&
    "name" in file
  );
}

export const POST = createRoute(async (c: Context) => {
  // Remove the POST route from covers.tsx - all upload handling in covers/upload.tsx
  return c.redirect("/dashboard/books/import/covers");
});
