import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { bookIdSchema } from "../../../../schemas/index.js";
import { formValidator, paramValidator } from "../../../../lib/validator.js";
import { getFlash, getUser } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import Breadcrumbs from "../../../../features/dashboard/admin/components/Breadcrumbs.js";
import InfoPage from "../../../../pages/InfoPage.js";
import {
  buildUpdateBookData,
  getBookById,
  updateBook
} from "../../../../features/dashboard/books/services.js";
import PublishToggleForm from "../../../../features/dashboard/books/components/PublishToggleForm.js";
import { BookFormAdmin } from "../../../../features/dashboard/admin/books/forms/BookForm.js";
import PreviewButton from "../../../../features/api/components/PreviewButton.js";
import BookCoverForm from "../../../../features/dashboard/images/forms/BookCoverForm.js";
import BookGalleryForm from "../../../../features/dashboard/images/forms/BookGalleryForm.js";
import { bookFormAdminSchema } from "../../../../features/dashboard/admin/books/schema.js";
import { showErrorAlert, showSuccessAlert } from "../../../../lib/alertHelpers.js";
import { resolvePublisher } from "../../../../features/dashboard/admin/creators/services.js";
import { resolveArtist } from "../../../../features/dashboard/admin/creators/services.js";
import { deleteBookByIdAdmin } from "../../../../features/dashboard/admin/books/services.js";
import Alert from "../../../../components/app/Alert.js";
import { dispatchEvents } from "../../../../lib/disatchEvents.js";
import BookApprovalForm from "../../../../features/dashboard/admin/books/forms/BookApprovalForm.js";
import { routeParam } from "../../../../lib/routeParam.js";
const GET = createRoute(
  paramValidator(bookIdSchema),
  async (c) => {
    const user = await getUser(c);
    const bookId = routeParam(c, "bookId");
    const flash = await getFlash(c);
    const currentPath = c.req.path;
    const [error, book] = await getBookById(bookId);
    if (error)
      return c.html(/* @__PURE__ */ jsx(InfoPage, { errorMessage: error.reason, user }));
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
                  { label: "Admin Books Overview", href: "/dashboard/admin/books" },
                  {
                    label: `Edit "${book.title}"`
                  }
                ]
              }
            ),
            /* @__PURE__ */ jsx("div", { class: "flex justify-end", children: /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-4", children: [
              /* @__PURE__ */ jsx(BookApprovalForm, { book }),
              /* @__PURE__ */ jsx(PublishToggleForm, { book, user }),
              /* @__PURE__ */ jsx(PreviewButton, { book, user })
            ] }) }),
            /* @__PURE__ */ jsx(BookFormAdmin, { bookId: book.id, formValues }),
            /* @__PURE__ */ jsx("hr", { class: "my-4" }),
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
            )
          ] })
        }
      )
    );
  }
);
const POST = createRoute(
  formValidator(bookFormAdminSchema),
  paramValidator(bookIdSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const user = await getUser(c);
    const bookId = c.req.valid("param").bookId;
    const book = await getBookById(bookId);
    if (!book) return showErrorAlert(c, "Book not found");
    const [artistError, artist] = await resolveArtist(formData, user.id);
    const [publisherError, publisher] = await resolvePublisher(formData, user);
    if (artistError) return showErrorAlert(c, artistError.reason);
    if (publisherError) return showErrorAlert(c, publisherError.reason);
    const bookData = buildUpdateBookData(
      formData,
      artist.id,
      publisher?.id ?? null
    );
    const [error, updatedBook] = await updateBook(bookData, bookId);
    if (error) return showErrorAlert(c, error.reason);
    return showSuccessAlert(c, `${updatedBook.title} updated!`);
  }
);
const DELETE = createRoute(
  paramValidator(bookIdSchema),
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const [error, deletedBook] = await deleteBookByIdAdmin(bookId);
    if (error) return showErrorAlert(c, error.reason);
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(Alert, { type: "success", message: `${deletedBook.title} deleted!` }),
        ",",
        dispatchEvents(["books:updated"])
      ] })
    );
  }
);
export {
  DELETE,
  GET,
  POST
};
