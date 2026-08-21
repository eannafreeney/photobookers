import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser } from "../../../utils.js";
import { getFlash } from "../../../utils.js";
import AppLayout from "../../../components/layouts/AppLayout.js";
import Page from "../../../components/layouts/Page.js";
import Breadcrumbs from "../../../features/dashboard/admin/components/Breadcrumbs.js";
import {
  buildUpdateBookData,
  deleteBookById,
  updateBook,
  updateBookPublicationStatus
} from "../../../features/dashboard/books/services.js";
import PublishToggleForm from "../../../features/dashboard/books/components/PublishToggleForm.js";
import PreviewButton from "../../../features/api/components/PreviewButton.js";
import BookPublishActions from "../../../features/dashboard/books/components/BookPublishActions.js";
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
import Banner from "../../../components/app/Banner.js";
import { dispatchEvents } from "../../../lib/disatchEvents.js";
import { createBookPublishedNotification } from "../../../domain/notifications/utils.js";
import { sendBookLiveEmailIfNeeded } from "../../../domain/books/liveEmail.js";
import Button from "../../../components/app/Button.js";
import FormPost from "../../../components/forms/FormPost.js";
import Tabs from "../../../components/app/Tabs.js";
import { serializePressLinks } from "../../../features/dashboard/books/pressLinks.js";
import { toDateInputValue } from "../../../lib/utils.js";
const GET = createRoute(
  paramValidator(bookIdSchema),
  requireBookEditAccess,
  async (c) => {
    const book = c.get("book");
    const user = await getUser(c);
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    const formValues = {
      title: book.title,
      artist_id: book.artistId,
      publisher_id: book.publisherId,
      description: book.description,
      purchase_link: book.purchaseLink,
      tags: book.tags?.join(", "),
      availability_status: book.availabilityStatus,
      release_date: toDateInputValue(book.releaseDate)
    };
    const publisherIsVerified = book?.publisher?.status === "verified";
    const isPublisher = user.creator?.type === "publisher";
    Object.assign(formValues, {
      press_links: serializePressLinks(book.pressLinks)
    });
    const bannerVariant = book.approvalStatus === "pending" ? "edit_pending" : book.approvalStatus === "rejected" ? "edit_rejected" : "hidden";
    const primaryAction = book.approvalStatus === "rejected" ? "submit_for_review" : "save";
    const defaultTab = c.req.query("tab") === "images" ? "images" : "info";
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
            /* @__PURE__ */ jsx(BookReviewProcessBanner, { variant: bannerVariant }),
            book.approvalStatus === "pending" && /* @__PURE__ */ jsx(
              "div",
              {
                id: "book-submit-review",
                "x-data": `{ hasCover: ${!!book.coverUrl} }`,
                ...{ "@cover:updated.window": "hasCover = true" },
                class: "relative flex border-outline bg-surface-alt p-4 text-on-surface border-b border-t",
                children: /* @__PURE__ */ jsxs("div", { class: "mx-auto flex flex-wrap items-center gap-2 px-6", children: [
                  /* @__PURE__ */ jsx("p", { "x-show": "!hasCover", class: "sm:text-sm text-pretty text-xs", children: "Add a cover image below, then submit for review." }),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      "x-show": "hasCover",
                      class: "sm:text-sm text-pretty text-xs",
                      "x-cloak": true,
                      children: "Cover uploaded! Submit this book for review when you're ready."
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    FormPost,
                    {
                      action: `/dashboard/books/${book.id}/resubmit`,
                      "x-target": "toast book-submit-review",
                      children: /* @__PURE__ */ jsx(
                        Button,
                        {
                          variant: "outline",
                          color: "success",
                          "x-bind:disabled": "!hasCover",
                          children: "Submit for review"
                        }
                      )
                    }
                  )
                ] })
              }
            ),
            !publisherIsVerified && book.approvalStatus === "approved" && /* @__PURE__ */ jsx("div", { class: "flex justify-end", children: /* @__PURE__ */ jsx("div", { class: "flex flex-wrap items-center justify-end gap-3", children: /* @__PURE__ */ jsx(BookPublishActions, { book, user }) }) }),
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
            /* @__PURE__ */ jsxs(Tabs, { defaultTab, hashMap: { "#book-images": "images" }, children: [
              /* @__PURE__ */ jsxs(Tabs.LinkContainer, { align: "left", children: [
                /* @__PURE__ */ jsx(Tabs.Link, { tabId: "info", children: "Details" }),
                /* @__PURE__ */ jsx(Tabs.Link, { tabId: "images", children: "Images" })
              ] }),
              /* @__PURE__ */ jsx(Tabs.Panel, { tabId: "info", children: /* @__PURE__ */ jsx(
                BookForm,
                {
                  action: `/dashboard/books/${book.id}`,
                  bookId: book.id,
                  formValues,
                  isPublisher,
                  primaryAction
                }
              ) }),
              /* @__PURE__ */ jsxs(Tabs.Panel, { tabId: "images", children: [
                !book.coverUrl && /* @__PURE__ */ jsx("div", { class: "mb-4", children: /* @__PURE__ */ jsx(
                  Banner,
                  {
                    type: "warning",
                    message: "A photo of the book is required. Cover files will be rejected."
                  }
                ) }),
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
                          initialImages: book.images?.map(
                            (image) => ({
                              id: image.id,
                              url: image.imageUrl
                            })
                          ) ?? [],
                          book,
                          user
                        }
                      )
                    ]
                  }
                )
              ] })
            ] })
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
    const usePageControls = form.controls === "page";
    const book = c.get("book");
    const user = await getUser(c);
    if (!book) return showErrorAlert(c, "Book not found");
    if (!book.artist) return showErrorAlert(c, "Artist not found");
    const publishControls = (nextBook) => usePageControls ? /* @__PURE__ */ jsx(BookPublishActions, { book: nextBook, user }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(PublishToggleForm, { book: nextBook, user }),
      /* @__PURE__ */ jsx(PreviewButton, { book: nextBook, user })
    ] });
    if (intent === "publish") {
      const [publishError, updatedBook] = await updateBookPublicationStatus(
        book.id,
        "published"
      );
      if (publishError) return showErrorAlert(c, publishError.reason, 400);
      await createBookPublishedNotification(user, book);
      await sendBookLiveEmailIfNeeded(book.id);
      return c.html(
        /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            Alert,
            {
              type: "success",
              message: `${updatedBook?.title ?? "Book"} Published!`
            }
          ),
          publishControls(updatedBook)
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
            publishControls(book)
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
          publishControls(updatedBook)
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
