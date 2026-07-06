import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import { getFlash } from "../../../utils.js";
import InfoPage from "../../../pages/InfoPage.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs.js";
import {
  buildUpdateBookData,
  deleteBookById,
  getBookById,
  updateBook,
  updateBookPublicationStatus
} from "../../../features/dashboard/books/services.js";
import PublishToggleForm from "../../../features/dashboard/books/components/PublishToggleForm.js";
import PreviewButton from "../../../features/api/components/PreviewButton.js";
import BookCoverForm from "../../../features/dashboard/images/forms/BookCoverForm.js";
import BookGalleryForm from "../../../features/dashboard/images/forms/BookGalleryForm.js";
import { BookForm } from "../../../features/dashboard/books/forms/BookForm.js";
import BookReviewProcessBanner from "../../../features/dashboard/books/components/BookReviewProcessBanner.js";
import { bookFormSchema } from "../../../features/dashboard/books/schema.js";
import { formValidator, paramValidator } from "../../../lib/validator.js";
import { bookIdSchema } from "../../../schemas/index.js";
import {
  requireBookDeleteAccess,
  requireBookEditAccess,
  requireBookPublishIntentAccess
} from "../../../middleware/bookGuard.js";
import { showErrorAlert, showSuccessAlert } from "../../../lib/alertHelpers.js";
import Alert from "../../../components/app/Alert.js";
import { dispatchEvents } from "../../../lib/disatchEvents.js";
import { createBookPublishedNotification } from "../../../domain/notifications/utils.js";
import Button from "../../../components/app/Button.js";
import FormPost from "../../../components/forms/FormPost.js";
const GET = createRoute(
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    const [err, book] = await getBookById(bookId);
    if (err || !book) {
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: "Book not found", user }));
    }
    const formValues = {
      title: book.title,
      artist_id: book.artistId,
      publisher_id: book.publisherId,
      description: book.description,
      purchase_link: book.purchaseLink,
      tags: book.tags?.join(", "),
      availability_status: book.availabilityStatus,
      release_date: book?.releaseDate ? new Date(book.releaseDate).toISOString().split("T")[0] : ""
    };
    const publisherIsVerified = book?.publisher?.status === "verified";
    const isPublisher = user.creator?.type === "publisher";
    const bannerVariant = book.approvalStatus === "pending" ? "edit_pending" : book.approvalStatus === "rejected" ? "edit_rejected" : "hidden";
    const primaryAction = book.approvalStatus === "rejected" ? "submit_for_review" : "save";
    return c.html(
      /* @__PURE__ */ jsx(
        AppLayout,
        {
          title: "Edit Book",
          user,
          flash,
          currentPath,
          children: /* @__PURE__ */ jsxs(Page, { children: [
            /* @__PURE__ */ jsx(
              Breadcrumbs,
              {
                items: [
                  { label: "Books Overview", href: "/dashboard" },
                  {
                    label: `Edit "${book.title}"`
                  }
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { class: "mb-4", children: /* @__PURE__ */ jsx(BookReviewProcessBanner, { variant: bannerVariant }) }),
            !publisherIsVerified && /* @__PURE__ */ jsx("div", { class: "flex justify-end", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(PublishToggleForm, { book, user }),
              /* @__PURE__ */ jsx(PreviewButton, { book, user })
            ] }) }),
            book.approvalStatus === "rejected" && /* @__PURE__ */ jsx(
              "div",
              {
                id: "book-resubmit",
                class: "relative flex border-outline bg-surface-alt p-4 text-on-surface border-b border-t",
                children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex flex-wrap items-center gap-2 px-6", children: [
                  /* @__PURE__ */ jsx("p", { class: "sm:text-sm text-pretty text-xs", children: "This book was not approved. Make your changes then resubmit for review." }),
                  /* @__PURE__ */ jsx(
                    FormPost,
                    {
                      action: `/dashboard/books/${book.id}/resubmit`,
                      "x-target": "toast book-resubmit",
                      children: /* @__PURE__ */ jsx(Button, { variant: "solid", color: "warning", children: "Resubmit for review" })
                    }
                  )
                ] })
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                class: "grid grid-cols-1 md:grid-cols-2 gap-4 mb-0",
                id: "book-images",
                children: [
                  /* @__PURE__ */ jsx(
                    BookCoverForm,
                    {
                      initialUrl: book.coverUrl ?? null,
                      book,
                      user
                    }
                  ),
                  /* @__PURE__ */ jsx("hr", { class: "my-4 md:hidden" }),
                  /* @__PURE__ */ jsx(
                    BookGalleryForm,
                    {
                      initialImages: book.images?.map((image) => ({
                        id: image.id,
                        url: image.imageUrl
                      })) ?? [],
                      book,
                      user
                    }
                  )
                ]
              }
            ),
            /* @__PURE__ */ jsx("hr", { class: "my-4" }),
            /* @__PURE__ */ jsx(
              BookForm,
              {
                action: `/dashboard/books/${bookId}`,
                bookId: book.id,
                formValues,
                isPublisher,
                primaryAction
              }
            )
          ] })
        }
      )
    );
  }
);
const POST = createRoute(
  paramValidator(bookIdSchema),
  formValidator(bookFormSchema),
  requireBookEditAccess,
  async (c) => {
    const formData = c.req.valid("form");
    const book = c.get("book");
    const bookData = buildUpdateBookData(formData);
    const [error, updatedBook] = await updateBook(bookData, book.id);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, `${updatedBook?.title ?? "Book"} updated!`);
  }
);
const PATCH = createRoute(
  paramValidator(bookIdSchema),
  requireBookPublishIntentAccess,
  async (c) => {
    const form = await c.req.parseBody();
    const intent = form.intent;
    const book = c.get("book");
    const user = await getUser(c);
    if (!book) return showErrorAlert(c, "Book not found");
    if (!book.artist) return showErrorAlert(c, "Artist not found");
    if (intent === "publish") {
      const [publishError, updatedBook] = await updateBookPublicationStatus(
        book.id,
        "published"
      );
      if (publishError) return showErrorAlert(c, publishError.reason, 400);
      await createBookPublishedNotification(user, book);
      return c.html(
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Alert,
            {
              type: "success",
              message: `${updatedBook?.title ?? "Book"} Published!`
            }
          ),
          /* @__PURE__ */ jsx(PublishToggleForm, { book: updatedBook, user }),
          /* @__PURE__ */ jsx(PreviewButton, { book: updatedBook, user })
        ] })
      );
    }
    if (intent === "unpublish") {
      const [unpublishError, updatedBook] = await updateBookPublicationStatus(
        book.id,
        "draft"
      );
      if (unpublishError) {
        return c.html(
          /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Alert, { type: "danger", message: unpublishError.reason }),
            /* @__PURE__ */ jsx(PublishToggleForm, { book, user })
          ] }),
          400
        );
      }
      return c.html(
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Alert,
            {
              type: "warning",
              message: `${updatedBook?.title ?? "Book"} Unpublished!`
            }
          ),
          /* @__PURE__ */ jsx(PublishToggleForm, { book: updatedBook, user }),
          /* @__PURE__ */ jsx(PreviewButton, { book: updatedBook, user })
        ] })
      );
    }
  }
);
const DELETE = createRoute(
  paramValidator(bookIdSchema),
  requireBookDeleteAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const user = await getUser(c);
    if (!user.creator) return showErrorAlert(c, "No Creator Profile Found");
    const deletedBook = await deleteBookById(bookId);
    if (!deletedBook) {
      return showErrorAlert(c, "Failed to delete book");
    }
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: `${deletedBook.title} deleted!` }),
        dispatchEvents(["books:updated"])
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  PATCH,
  POST
};
