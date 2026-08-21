import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../utils.js";
import AppLayout from "../../components/layouts/AppLayout.js";
import MemberDashboardShell from "../../features/dashboard/components/MemberDashboardShell.js";
import { BookForm } from "../../features/dashboard/books/forms/BookForm.js";
import { bookFormSchema } from "../../features/dashboard/books/schema.js";
import { limitBooksPerDay } from "../../middleware/booksPerDayLimit.js";
import { formValidator } from "../../lib/validator.js";
import { showErrorAlert } from "../../lib/alertHelpers.js";
import {
  resolveArtist,
  resolvePublisher
} from "../../features/dashboard/admin/creators/services.js";
import {
  buildCreateBookData,
  createBook,
  getNewBookModerationForUser
} from "../../features/dashboard/books/services.js";
import { serializePressLinks } from "../../features/dashboard/books/pressLinks.js";
import Link from "../../components/app/Link.js";
import Table from "../../components/app/Table.js";
import EditRowButton from "../../features/app/components/EditRowButton.js";
import DeleteRowButton from "../../features/app/components/DeleteRowButton.js";
import BookApprovalStatusPill from "../../features/dashboard/admin/books/components/BookApprovalStatusPill.js";
import {
  getSubmittedBooksByUserId
} from "../../domain/contributors/services.js";
function canContributorEdit(book) {
  return book.artist?.status !== "verified" && book.publisher?.status !== "verified";
}
const SubmissionRow = ({ book }) => {
  const editable = canContributorEdit(book);
  return /* @__PURE__ */ jsxs("tr", { class: "border-b border-outline", children: [
    /* @__PURE__ */ jsx("td", { class: "p-4", children: book.coverUrl ? /* @__PURE__ */ jsx(
      "img",
      {
        src: book.coverUrl,
        alt: book.title,
        class: "h-12 w-9 rounded object-cover"
      }
    ) : /* @__PURE__ */ jsx("div", { class: "h-12 w-9 rounded bg-surface-alt" }) }),
    /* @__PURE__ */ jsx("td", { class: "p-4 font-medium text-on-surface-strong", children: book.title }),
    /* @__PURE__ */ jsx("td", { class: "p-4 text-on-surface-weak", children: book.artist?.displayName ?? "\u2014" }),
    /* @__PURE__ */ jsx("td", { class: "p-4 text-on-surface-weak", children: book.publisher?.displayName ?? "\u2014" }),
    /* @__PURE__ */ jsx("td", { class: "p-4", children: /* @__PURE__ */ jsx(
      BookApprovalStatusPill,
      {
        approvalStatus: book.approvalStatus ?? "pending"
      }
    ) }),
    /* @__PURE__ */ jsx("td", { class: "p-4", children: editable ? /* @__PURE__ */ jsxs("div", { class: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(EditRowButton, { href: `/dashboard/books/${book.id}` }),
      /* @__PURE__ */ jsx(
        DeleteRowButton,
        {
          action: `/dashboard/books/${book.id}`,
          confirm: `Delete "${book.title}"?`
        }
      )
    ] }) : null })
  ] });
};
const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const formValues = { press_links: serializePressLinks([]) };
  const contributions = await getSubmittedBooksByUserId(user.id);
  return c.html(
    /* @__PURE__ */ jsx(AppLayout, { title: "Contribute a Book", user, currentPath, children: /* @__PURE__ */ jsxs(MemberDashboardShell, { user, currentPath, children: [
      /* @__PURE__ */ jsxs("div", { class: "flex flex-col gap-2 border-b-2 border-on-surface-strong pb-6 mb-6", children: [
        /* @__PURE__ */ jsx("span", { class: "kicker text-accent", children: "Contribute" }),
        /* @__PURE__ */ jsx("h1", { class: "font-display text-3xl md:text-4xl font-medium leading-tight text-on-surface-strong", children: "Add a book to the catalog" }),
        /* @__PURE__ */ jsxs("p", { class: "max-w-2xl text-sm md:text-base text-on-surface text-pretty", children: [
          "Know a photobook that's missing? Add it here and upload a cover image. Every book is reviewed before it goes live. You'll be credited in the colophon and appear on the",
          " ",
          /* @__PURE__ */ jsx(Link, { href: "/leaderboard", hoverUnderline: true, children: "contributor leaderboard" }),
          "."
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        BookForm,
        {
          action: "/dashboard/contribute",
          isPublisher: false,
          isContributor: true,
          primaryAction: "save",
          formValues
        }
      ),
      contributions.length > 0 && /* @__PURE__ */ jsxs("div", { class: "mt-12", children: [
        /* @__PURE__ */ jsx("h2", { class: "font-display text-xl font-medium text-on-surface-strong mb-4", children: "Your contributions" }),
        /* @__PURE__ */ jsxs(Table, { children: [
          /* @__PURE__ */ jsx(Table.Head, { children: /* @__PURE__ */ jsxs("tr", { children: [
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Cover" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Title" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Artist" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Publisher" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: "Approval" }),
            /* @__PURE__ */ jsx(Table.HeadRow, { children: /* @__PURE__ */ jsx("span", { class: "sr-only", children: "Actions" }) })
          ] }) }),
          /* @__PURE__ */ jsx(Table.Body, { children: contributions.map((book) => /* @__PURE__ */ jsx(SubmissionRow, { book }, book.id)) })
        ] })
      ] })
    ] }) })
  );
});
const POST = createRoute(
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const [artistError, artist] = await resolveArtist(formData, user.id);
    if (artistError) return showErrorAlert(c, artistError.reason);
    const [publisherError, publisher] = await resolvePublisher(formData, user);
    if (publisherError) return showErrorAlert(c, publisherError.reason);
    const moderation = await getNewBookModerationForUser(user);
    const bookData = await buildCreateBookData(
      formData,
      artist,
      user.id,
      publisher,
      moderation
    );
    bookData.submittedByUserId = user.id;
    const newBook = await createBook(bookData);
    if (!newBook) return showErrorAlert(c, "Failed to create book");
    await setFlash(
      c,
      "success",
      `"${newBook.title}" saved! Now add a cover image, then submit for review.`
    );
    return c.redirect(`/dashboard/books/${newBook.id}?tab=images`);
  }
);
export {
  GET,
  POST
};
