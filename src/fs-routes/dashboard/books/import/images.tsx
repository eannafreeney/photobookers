import { createRoute } from "hono-fsr";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs";
import InfoPage from "../../../../pages/InfoPage";
import { getFlash, getUser } from "../../../../utils";
import BulkCoverUpload from "../../../../features/dashboard/books/import/components/BulkCoverUpload";
import { getBooksForBulkBookImagesUpload } from "../../../../features/dashboard/books/services";

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
    return c.html(
      <InfoPage errorMessage="No valid book IDs provided" user={user} />,
    );
  }

  const [error, creatorBooks] = await getBooksForBulkBookImagesUpload(bookIds, user);
  if (error || !creatorBooks || creatorBooks.length === 0) {
    return c.html(
      <InfoPage
        errorMessage="Failed to get books for bulk cover upload"
        user={user}
      />,
    );
  }

  return c.html(
    <AppLayout
      title="Upload Images"
      user={user}
      flash={flash}
      currentPath={currentPath}
    >
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard/books" },
            { label: "Import CSV", href: "/dashboard/books/import" },
            { label: "Upload Images" },
          ]}
        />
        <BulkCoverUpload books={creatorBooks} />
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(async (c: Context) => {
  // Remove the POST route from images.tsx - all upload handling in images/upload.tsx
  return c.redirect("/dashboard/books/import/images");
});
