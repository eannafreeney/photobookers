import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../utils.js";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs.js";
import Page from "../../../components/layouts/Page.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import { BookForm } from "../../../features/dashboard/books/forms/BookForm.js";
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
import { shouldModerateNewBook } from "../../../lib/bookModeration.js";
import { notifyAdminBookPendingReview } from "../../../features/dashboard/admin/notifications/services.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const isPublisher = user.creator?.type === "publisher";
  const moderation = await getNewBookModerationForUser(user);
  const needsReview = shouldModerateNewBook({
    creatorVerifiedAt: moderation.creatorVerifiedAt,
    creatorStatus: moderation.creatorStatus,
    booksUploadedSinceVerificationBeforeInsert: moderation.booksUploadedSinceVerificationBeforeInsert,
    approvedBooksSinceVerificationBeforeInsert: moderation.approvedBooksSinceVerificationBeforeInsert
  });
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
      /* @__PURE__ */ jsx("div", { class: "mb-4", children: /* @__PURE__ */ jsx(
        BookReviewProcessBanner,
        {
          variant: needsReview ? "create_moderated" : "create_trusted"
        }
      ) }),
      /* @__PURE__ */ jsx(
        BookForm,
        {
          action: "/dashboard/books/new",
          isPublisher,
          primaryAction: needsReview ? "submit_for_review" : "save"
        }
      )
    ] }) })
  );
});
const POST = createRoute(
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");
    const formData = c.req.valid("form");
    const intent = formData.intent;
    let artist;
    let publisher;
    if (intent === "publisher") {
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
    const newBook = await createBook(bookData);
    if (!newBook) return showErrorAlert(c, "Failed to create book");
    if (newBook.approvalStatus === "pending") {
      await notifyAdminBookPendingReview({
        bookId: newBook.id,
        title: newBook.title,
        actorUserId: user.id
      });
    }
    await setFlash(c, "success", `Successfully created "${newBook.title}"!`);
    return c.redirect(`/dashboard/books/${newBook.id}`);
  }
);
export {
  GET,
  POST
};
