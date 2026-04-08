import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../../utils";
import { Context } from "hono";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { BookFormAdmin } from "../../../../features/dashboard/admin/books/forms/BookForm";
import { formValidator } from "../../../../lib/validator";
import { bookFormAdminSchema } from "../../../../features/dashboard/admin/books/schema";
import { showErrorAlert } from "../../../../lib/alertHelpers";
import {
  resolveArtist,
  resolvePublisher,
} from "../../../../features/dashboard/admin/creators/services";
import {
  buildCreateBookData,
  createBook,
} from "../../../../features/dashboard/books/services";
import Alert from "../../../../components/app/Alert";
import { BookFormContext } from "../../../../features/dashboard/books/types";
import NavTabs from "../../../../features/dashboard/admin/components/NavTabs";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  return c.html(
    <AppLayout title="Books" user={user} currentPath={currentPath}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/books" />
        <BookFormAdmin />
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  formValidator(bookFormAdminSchema),
  async (c: BookFormContext) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    const [artistError, artist] = await resolveArtist(formData, user.id);
    const [publisherError, publisher] = await resolvePublisher(formData, user);

    if (artistError) return showErrorAlert(c, artistError.reason);
    if (publisherError) return showErrorAlert(c, publisherError.reason);

    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
    );
    const newBook = await createBook(bookData);

    if (!newBook) {
      return c.html(
        <Alert type="danger" message="Failed to create book" />,
        422,
      );
    }

    await setFlash(c, "success", `${newBook.title} created!`);
    return c.redirect(`/dashboard/admin/books/${newBook.id}`, 303);
  },
);
