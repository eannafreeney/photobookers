import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../utils.js";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs.js";
import Page from "../../../components/layouts/Page.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import { BookForm } from "../../../features/dashboard/books/forms/BookForm.js";
import Tabs from "../../../components/app/Tabs.js";
import { bookFormSchema } from "../../../features/dashboard/books/schema.js";
import { limitBooksPerDay } from "../../../middleware/booksPerDayLimit.js";
import { formValidator } from "../../../lib/validator.js";
import { showErrorAlert } from "../../../lib/alertHelpers.js";
import {
  resolveArtist,
  resolvePublisher
} from "../../../features/dashboard/admin/creators/services.js";
import {
  buildCreateBookData,
  createBook,
  getNewBookModerationForUser
} from "../../../features/dashboard/books/services.js";
import BookReviewProcessBanner from "../../../features/dashboard/books/components/BookReviewProcessBanner.js";
import { serializePressLinks } from "../../../features/dashboard/books/pressLinks.js";
import { canCreateBook } from "../../../lib/permissions.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  if (!canCreateBook(user)) return c.redirect("/dashboard");
  const currentPath = c.req.path;
  const isPublisher = user.creator?.type === "publisher";
  const formValues = { press_links: serializePressLinks([]) };
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Add Book", user, currentPath, children: /* @__PURE__ */ jsxs(Page, { children: [
      /* @__PURE__ */ jsx(
        Breadcrumbs,
        {
          items: [
            { label: "Books Overview", href: "/dashboard" },
            {
              label: `Create Book`
            }
          ]
        }
      ),
      /* @__PURE__ */ jsx(BookReviewProcessBanner, { variant: "create_moderated" }),
      /* @__PURE__ */ jsxs(Tabs, { defaultTab: "info", children: [
        /* @__PURE__ */ jsxs(Tabs.LinkContainer, { align: "left", children: [
          /* @__PURE__ */ jsx(Tabs.Link, { tabId: "info", children: "Details" }),
          /* @__PURE__ */ jsx(
            Tabs.Link,
            {
              tabId: "images",
              disabled: true,
              title: "Save the book first to add images",
              children: "Images"
            }
          )
        ] }),
        /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "info", children: /* @__PURE__ */ jsx(
          BookForm,
          {
            action: "/dashboard/books/new",
            isPublisher,
            primaryAction: "save",
            formValues
          }
        ) })
      ] })
    ] }) })
  );
});
const POST = createRoute(
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    if (!canCreateBook(user)) return showErrorAlert(c, "Not allowed");
    const formData = c.req.valid("form");
    const intent = formData.intent;
    const isContributor = !user.creator;
    let artist;
    let publisher;
    if (isContributor) {
      const [artistError, resolvedArtist] = await resolveArtist(
        formData,
        user.id
      );
      if (artistError) return showErrorAlert(c, artistError.reason);
      artist = resolvedArtist;
      const [publisherError, resolvedPublisher] = await resolvePublisher(
        formData,
        user
      );
      if (publisherError) return showErrorAlert(c, publisherError.reason);
      publisher = resolvedPublisher;
    } else if (intent === "publisher") {
      const [artistError, resolvedArtist] = await resolveArtist(
        formData,
        user.id
      );
      if (artistError) return showErrorAlert(c, artistError.reason);
      artist = resolvedArtist;
      publisher = user.creator;
    } else {
      const [publisherError, resolvedPublisher] = await resolvePublisher(
        formData,
        user
      );
      if (publisherError) return showErrorAlert(c, publisherError.reason);
      artist = user.creator;
      publisher = resolvedPublisher;
    }
    const moderation = await getNewBookModerationForUser(user);
    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
      moderation
    );
    if (isContributor) {
      bookData.submittedByUserId = user.id;
    }
    const newBook = await createBook(bookData);
    if (!newBook) return showErrorAlert(c, "Failed to create book");
    await setFlash(c, "success", `"${newBook.title}" saved! Now add a cover image, then submit for review.`);
    return c.redirect(`/dashboard/books/${newBook.id}?tab=images`);
  }
);
export {
  GET,
  POST
};
