import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../utils";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs";
import Page from "../../../components/layouts/Page";
import AppLayout from "../../../components/layouts/AppLayout";
import { BookForm } from "../../../features/dashboard/books/forms/BookForm";
import Tabs from "../../../components/app/Tabs";
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
  getNewBookModerationForUser,
} from "../../../features/dashboard/books/services";
import BookReviewProcessBanner from "../../../features/dashboard/books/components/BookReviewProcessBanner";
import { serializePressLinks } from "../../../features/dashboard/books/pressLinks";
import { canCreateBook } from "../../../lib/permissions";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!canCreateBook(user)) return c.redirect("/dashboard");

  const currentPath = c.req.path;
  const isPublisher = user.creator?.type === "publisher";
  const formValues = { press_links: serializePressLinks([]) };

  return c.html(
    <AppLayout title="Add Book" user={user} currentPath={currentPath}>
      <Page>
        <Breadcrumbs
          items={[
            { label: "Books Overview", href: "/dashboard" },
            {
              label: `Create Book`,
            },
          ]}
        />
        <div class="mb-4">
          <BookReviewProcessBanner variant="create_moderated" />
        </div>
        <Tabs defaultTab="info">
          <Tabs.LinkContainer align="left">
            <Tabs.Link tabId="info">Details</Tabs.Link>
            <Tabs.Link
              tabId="images"
              disabled
              title="Save the book first to add images"
            >
              Images
            </Tabs.Link>
          </Tabs.LinkContainer>
          <Tabs.Panel tabId="info">
            <BookForm
              action="/dashboard/books/new"
              isPublisher={isPublisher}
              primaryAction="save"
              formValues={formValues}
            />
          </Tabs.Panel>
        </Tabs>
      </Page>
    </AppLayout>,
  );
});

export const POST = createRoute(
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c: BookFormContext) => {
    const user = await getUser(c);
    if (!canCreateBook(user)) return showErrorAlert(c, "Not allowed");

    const formData = c.req.valid("form");
    const intent = formData.intent; // "publisher" | "artist"
    const isContributor = !user.creator;

    let artist;
    let publisher;

    if (isContributor) {
      // ponytail: contributor picks both artist + publisher via ComboBox, they aren't either
      const [artistError, resolvedArtist] = await resolveArtist(
        formData,
        user.id,
      );
      if (artistError) return showErrorAlert(c, artistError.reason);
      artist = resolvedArtist;

      const [publisherError, resolvedPublisher] = await resolvePublisher(
        formData,
        user,
      );
      if (publisherError) return showErrorAlert(c, publisherError.reason);
      publisher = resolvedPublisher;
    } else if (intent === "publisher") {
      const [artistError, resolvedArtist] = await resolveArtist(
        formData,
        user.id,
      );
      if (artistError) return showErrorAlert(c, artistError.reason);
      artist = resolvedArtist;
      publisher = user.creator!;
    } else {
      const [publisherError, resolvedPublisher] = await resolvePublisher(
        formData,
        user,
      );
      if (publisherError) return showErrorAlert(c, publisherError.reason);
      artist = user.creator!;
      publisher = resolvedPublisher;
    }

    const moderation = await getNewBookModerationForUser(user);
    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
      moderation,
    );

    if (isContributor) {
      (bookData as any).submittedByUserId = user.id;
    }

    const newBook = await createBook(bookData);

    if (!newBook) return showErrorAlert(c, "Failed to create book");

    await setFlash(c, "success", `"${newBook.title}" saved! Now add a cover image, then submit for review.`);
    return c.redirect(`/dashboard/books/${newBook.id}?tab=images`);
  },
);
