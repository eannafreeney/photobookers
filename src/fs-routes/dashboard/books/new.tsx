import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../utils";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import { BookForm } from "../../../features/dashboard/books/forms/BookForm";
import { bookFormSchema } from "../../../features/dashboard/books/schema";
import { limitBooksPerDay } from "../../../middleware/booksPerDayLimit";
import { formValidator } from "../../../lib/validator";
import { BookFormContext } from "../../../features/dashboard/books/types";
import { showErrorAlert } from "../../../lib/alertHelpers";
import {
  resolveArtist,
  resolvePublisher,
} from "../../../features/dashboard/admin/creators/services";
import {
  buildCreateBookData,
  createBook,
} from "../../../features/dashboard/books/services";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const isPublisher = user.creator?.type === "publisher";

  return c.html(
    <AppLayout title="Add Book" user={user} currentPath={currentPath}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard/books" },
            {
              label: `Create Book`,
            },
          ]}
        />
        <BookForm action="/dashboard/books/new" isPublisher={isPublisher} />
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c: BookFormContext) => {
    const user = await getUser(c);
    if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");

    const formData = c.req.valid("form");
    const intent = formData.intent; // "publisher" | "artist"

    let artist;
    let publisher;

    if (intent === "publisher") {
      const [artistError, resolvedArtist] = await resolveArtist(
        formData,
        user.id,
      );
      if (artistError) return showErrorAlert(c, artistError.reason);
      artist = resolvedArtist;
      publisher = user.creator;
    } else {
      const [publisherError, resolvedPublisher] = await resolvePublisher(
        formData,
        user,
      );
      if (publisherError) return showErrorAlert(c, publisherError.reason);
      artist = user.creator;
      publisher = resolvedPublisher;
    }

    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
    );
    const newBook = await createBook(bookData);

    if (!newBook) return showErrorAlert(c, "Failed to create book");

    await setFlash(c, "success", `Successfully created "${newBook.title}"!`);
    return c.redirect(`/dashboard/books/${newBook.id}`);
  },
);
