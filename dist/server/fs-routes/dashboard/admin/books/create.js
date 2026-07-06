import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../../../utils.js";
import AppLayout from "../../../../components/layouts/AppLayout.js";
import Page from "../../../../components/layouts/Page.js";
import { BookFormAdmin } from "../../../../features/dashboard/admin/books/forms/BookForm.js";
import { formValidator } from "../../../../lib/validator.js";
import { bookFormAdminSchema } from "../../../../features/dashboard/admin/books/schema.js";
import { showErrorAlert } from "../../../../lib/alertHelpers.js";
import {
  resolveArtist,
  resolvePublisher
} from "../../../../features/dashboard/admin/creators/services.js";
import {
  buildCreateBookData,
  createBook
} from "../../../../features/dashboard/books/services.js";
import Alert from "../../../../components/app/Alert.js";
import Sidebar from "../../../../components/app/Sidebar.js";
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Books", user, currentPath, children: /* @__PURE__ */ jsx(Page, { children: /* @__PURE__ */ jsx(Sidebar, { currentPath, children: /* @__PURE__ */ jsx(BookFormAdmin, {}) }) }) })
  );
});
const POST = createRoute(
  formValidator(bookFormAdminSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const [artistError, artist] = await resolveArtist(formData, user.id);
    const [publisherError, publisher] = await resolvePublisher(formData, user);
    if (artistError) return showErrorAlert(c, artistError.reason);
    if (publisherError) return showErrorAlert(c, publisherError.reason);
    const adminModeration = {
      isAdminContext: true,
      creatorVerifiedAt: null,
      creatorStatus: "stub",
      booksUploadedSinceVerificationBeforeInsert: 0,
      approvedBooksSinceVerificationBeforeInsert: 0
    };
    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
      adminModeration
    );
    const newBook = await createBook(bookData);
    if (!newBook) {
      return c.html(
        /* @__PURE__ */ jsx(Alert, { type: "danger", message: "Failed to create book" }),
        422
      );
    }
    await setFlash(c, "success", `${newBook.title} created!`);
    return c.redirect(`/dashboard/admin/books/${newBook.id}`, 303);
  }
);
export {
  GET,
  POST
};
