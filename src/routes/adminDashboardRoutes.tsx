import { Context, Hono } from "hono";
import Alert from "../components/app/Alert";
import { getFlash, getUser, setFlash } from "../utils";
import {
  approveClaim,
  assignCreatorToUserManually,
  generateClaimApprovalEmail,
  generateClaimRejectionEmail,
  rejectClaim,
} from "../services/claims";
import {
  createStubCreatorProfile,
  getCreatorById,
  resolveArtist,
  resolvePublisher,
  updateCreatorProfile,
} from "../services/creators";
import { supabaseAdmin } from "../lib/supabase";
import ClaimsTable from "../components/admin/ClaimsTable";
import AppLayout from "../components/layouts/AppLayout";
import Page from "../components/layouts/Page";
import CreatorFormAdmin from "../components/admin/CreatorFormAdmin";
import {
  bookFormSchema,
  bookIdSchema,
  bookOfTheDayFormSchema,
  bookOfTheWeekFormSchema,
  creatorFormAdminSchema,
  creatorIdSchema,
  manualAssignCreatorSchema,
} from "../schemas";
import { formValidator, paramValidator } from "../lib/validator";
import { CreatorsTable } from "../components/admin/CreatorsTable";
import {
  deleteBookByIdAdmin,
  deleteCreatorByIdAdmin,
  getClaimById,
} from "../services/admin";
import { requireAdminAccess } from "../middleware/adminGuard";
import BooksTable from "../components/admin/BooksTable";
import NavTabs from "../components/admin/NavTabs";
import SectionTitle from "../components/app/SectionTitle";
import {
  createBook,
  getBookById,
  prepareBookData,
  prepareBookUpdateData,
  updateBook,
} from "../services/books";
import { BookFormAdmin } from "../components/admin/BookFormAdmin";
import EditBookFormAdmin from "../components/admin/EditBookFormAdmin";
import { UserProvider } from "../contexts/UserContext";
import Modal from "../components/app/Modal";
import Input from "../components/cms/ui/Input";
import DateInput from "../components/cms/ui/DateInput";
import Button from "../components/app/Button";
import { setBookOfTheDay } from "../services/bookOfTheDay";
import BookOfTheDayForm from "../components/admin/BookOfTheDayForm";
import BookOfTheWeekForm from "../components/admin/BookOfTheWeekForm";
import {
  deleteBookOfTheWeekByIdAdmin,
  setBookOfTheWeek,
  updateBookOfTheWeek,
} from "../services/bookOfTheWeek";
import { toWeekString } from "../lib/utils";
import BooksPage from "../pages/admin/BooksPage";
import EditCreatorPageAdmin from "../pages/admin/EditCreatorPageAdmin";
import { findUserByEmail, getUserById } from "../services/users";

export const adminDashboardRoutes = new Hono();

export const showErrorAlert = (
  c: Context,
  errorMessage: string = "Action Failed! Please try again.",
) => c.html(<Alert type="danger" message={errorMessage} />, 422);

adminDashboardRoutes.get("/", requireAdminAccess, async (c) => {
  return c.redirect("/dashboard/admin/books");
});

adminDashboardRoutes.get("/books", requireAdminAccess, async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  const flash = await getFlash(c);
  const page = Number(c.req.query("page") ?? 1);
  const currentPath = c.req.path;

  return c.html(
    <BooksPage
      user={user}
      flash={flash}
      searchQuery={searchQuery}
      currentPage={page}
      currentPath={currentPath}
    />,
  );
});

adminDashboardRoutes.get("/books/new", requireAdminAccess, async (c) => {
  const user = await getUser(c);

  return c.html(
    <AppLayout title="Books" user={user}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/books" />
        <BookFormAdmin />
      </Page>
    </AppLayout>,
  );
});

adminDashboardRoutes.post(
  "/books/new",
  requireAdminAccess,
  formValidator(bookFormSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");

    const artist = await resolveArtist(formData, user.id);
    const publisher = await resolvePublisher(formData, user.id);

    if (artist === "error" || !artist) {
      return showErrorAlert(c, "Invalid artist");
    }

    if (publisher === "error") {
      return showErrorAlert(c, "Invalid publisher");
    }

    const bookData = await prepareBookData(
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
    return c.redirect("/dashboard/admin/books");
  },
);

adminDashboardRoutes.get(
  "/books/edit/:bookId",
  requireAdminAccess,
  paramValidator(bookIdSchema),
  async (c) => {
    const user = await getUser(c);
    const bookId = c.req.param("bookId");
    const flash = await getFlash(c);

    return c.html(
      <EditBookFormAdmin bookId={bookId} user={user} flash={flash} />,
    );
  },
);

adminDashboardRoutes.post(
  "/books/edit/:bookId",
  requireAdminAccess,
  formValidator(bookFormSchema),
  paramValidator(bookIdSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const user = await getUser(c);
    const bookId = c.req.valid("param").bookId;
    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    const artist = await resolveArtist(formData, user.id);
    const publisher = await resolvePublisher(formData, user.id);

    if (artist === "error" || !artist) {
      return showErrorAlert(c, "Invalid artist");
    }

    if (publisher === "error") {
      return showErrorAlert(c, "Invalid publisher");
    }

    const bookData = await prepareBookUpdateData(formData);
    const updatedBook = await updateBook(bookData, bookId);
    if (!updatedBook) {
      return showErrorAlert(c, "Failed to update book");
    }

    await setFlash(c, "success", `${updatedBook.title} updated!`);
    return c.redirect(`/dashboard/admin/books`);
  },
);

adminDashboardRoutes.get("/claims", requireAdminAccess, async (c) => {
  const user = await getUser(c);
  return c.html(
    <AppLayout title="Admin Dashboard" user={user}>
      <NavTabs currentPath="/dashboard/admin/books" />
      <SectionTitle>Claims Pending Admin Review</SectionTitle>
      <ClaimsTable />
    </AppLayout>,
  );
});

adminDashboardRoutes.get("/creators", requireAdminAccess, async (c) => {
  const user = await getUser(c);
  const searchQuery = c.req.query("search");
  return c.html(
    <AppLayout title="New Creator" user={user}>
      <Page>
        <NavTabs currentPath="/dashboard/admin/creators" />
        <SectionTitle>Creators</SectionTitle>
        <CreatorFormAdmin />
        <CreatorsTable searchQuery={searchQuery} />
      </Page>
    </AppLayout>,
  );
});

adminDashboardRoutes.get(
  "/creators/edit/:creatorId",
  paramValidator(creatorIdSchema),
  requireAdminAccess,
  async (c) => {
    const user = await getUser(c);
    const creatorId = c.req.valid("param").creatorId;
    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return showErrorAlert(c, "Creator not found");
    }
    const currentPath = c.req.path;
    const currentPage = Number(c.req.query("page") ?? 1);

    let ownerEmail: string | null = null;
    if (creator.ownerUserId) {
      const owner = await getUserById(creator.ownerUserId);
      ownerEmail = owner?.email ?? null;
    }

    return c.html(
      <EditCreatorPageAdmin
        user={user}
        creator={creator}
        currentPath={currentPath}
        currentPage={currentPage}
        ownerEmail={ownerEmail}
      />,
    );
  },
);

adminDashboardRoutes.post(
  "/creators/edit/:creatorId",
  requireAdminAccess,
  formValidator(creatorFormAdminSchema),
  paramValidator(creatorIdSchema),
  async (c) => {
    const formData = c.req.valid("form");
    const creatorId = c.req.valid("param").creatorId;
    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return showErrorAlert(c, "Creator not found");
    }
    const updatedCreator = await updateCreatorProfile(formData, creatorId);
    if (!updatedCreator) {
      return showErrorAlert(c, "Failed to update creator");
    }
    return c.html(
      <>
        <Alert type="success" message="Creator updated!" />
        <CreatorFormAdmin />
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/claims/:claimId/approve",
  requireAdminAccess,
  async (c) => {
    const claimId = c.req.param("claimId");
    const claim = await getClaimById(claimId);
    if (!claim) {
      return showErrorAlert(c, "Claim not found");
    }
    const user = await getUser(c);
    const creator = await getCreatorById(claim.creatorId);
    if (!user || !creator) {
      return showErrorAlert(c, "User or creator not found");
    }

    await approveClaim(claimId);
    const emailHTML = await generateClaimApprovalEmail(user, creator);

    try {
      const { error } = await supabaseAdmin.functions.invoke("send-email", {
        body: {
          to: user?.email,
          subject: `Your Claim for ${creator.displayName} has been approved`,
          html: emailHTML,
        },
        headers: {
          "x-function-secret": process.env.FUNCTION_SECRET ?? "",
        },
      });

      if (error) {
        console.error("Failed to send email:", error);
        return showErrorAlert(
          c,
          "Failed to send approval email. Please try again.",
        );
      }
    } catch (error) {
      console.error("Email error:", error);
      return showErrorAlert(
        c,
        "Failed to send approval email. Please try again.",
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Claim approved!" />
        <ClaimsTable />
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/claims/:claimId/reject",
  requireAdminAccess,
  async (c) => {
    const claimId = c.req.param("claimId");
    const claim = await getClaimById(claimId);
    if (!claim) {
      return showErrorAlert(c, "Claim not found");
    }
    const user = await getUser(c);
    const creator = await getCreatorById(claim.creatorId);
    if (!user || !creator) {
      return showErrorAlert(c, "User or creator not found");
    }

    await rejectClaim(claimId);
    const emailHTML = await generateClaimRejectionEmail(user, creator);

    try {
      const { error } = await supabaseAdmin.functions.invoke("send-email", {
        body: {
          to: user?.email,
          subject: `Your Claim for ${creator.displayName} has been rejected`,
          html: emailHTML,
        },
        headers: {
          "x-function-secret": process.env.FUNCTION_SECRET ?? "",
        },
      });

      if (error) {
        console.error("Failed to send email:", error);
        return showErrorAlert(
          c,
          "Failed to send rejection email. Please try again.",
        );
      }
    } catch (error) {
      console.error("Email error:", error);
      return showErrorAlert(
        c,
        "Failed to send rejection email. Please try again.",
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Claim rejected!" />
        <ClaimsTable />
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/creators/new",
  requireAdminAccess,
  formValidator(creatorFormAdminSchema),
  async (c) => {
    const user = await getUser(c);
    const formData = c.req.valid("form");
    const displayName = formData.displayName;
    const website = formData.website;
    const type = formData.type;

    try {
      await createStubCreatorProfile(displayName, user.id, type, website);
    } catch (error) {
      return showErrorAlert(
        c,
        "Failed to create stub creator profile. Please try again.",
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Creator created!" />
        <CreatorsTable searchQuery={undefined} />
        <CreatorFormAdmin />
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/creators/delete/:creatorId",
  paramValidator(creatorIdSchema),
  requireAdminAccess,
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const creator = await getCreatorById(creatorId);
    if (!creator) {
      return showErrorAlert(c, "Creator not found");
    }
    const deletedCreator = await deleteCreatorByIdAdmin(creatorId);
    if (!deletedCreator) {
      return showErrorAlert(c, "Failed to delete creator");
    }
    return c.html(
      <>
        <Alert type="success" message="Creator deleted!" />
        <CreatorsTable searchQuery={undefined} />
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/books/delete/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    const deletedBook = await deleteBookByIdAdmin(bookId);

    if (!deletedBook) {
      return showErrorAlert(c, "Failed to delete book");
    }
    return c.html(
      <>
        <div id="server_events">
          <div x-init="$dispatch('books:updated')"></div>
        </div>
        <Alert type="success" message={`${deletedBook.title} deleted!`} />,
      </>,
    );
  },
);

// adminDashboardRoutes.get(
//   "/book-of-the-day/:bookId",
//   paramValidator(bookIdSchema),
//   requireAdminAccess,
//   async (c) => {
//     const bookId = c.req.param("bookId");
//     const book = await getBookById(bookId);
//     if (!book) {
//       return showErrorAlert(c, "Book not found");
//     }

//     return c.html(
//       <Modal title="Set Book of the Day">
//         <BookOfTheDayForm book={book} />
//       </Modal>,
//     );
//   },
// );

// adminDashboardRoutes.post(
//   "/book-of-the-day/:bookId",
//   formValidator(bookOfTheDayFormSchema),
//   paramValidator(bookIdSchema),
//   requireAdminAccess,
//   async (c) => {
//     const formData = c.req.valid("form");
//     const bookId = c.req.valid("param").bookId;

//     const bookOfTheDay = await setBookOfTheDay({
//       date: formData.date,
//       bookId: bookId,
//       text: formData.text,
//     });

//     const book = await getBookById(bookId);
//     if (!book) return showErrorAlert(c, "Book not found");

//     if (!bookOfTheDay) {
//       return c.html(
//         <div
//           id="book-of-the-day-errors"
//           class="text-danger text-xs my-2"
//           role="alert"
//         >
//           That date already has a book of the day, or this book is already
//           chosen for another date.
//         </div>,

//         422,
//       );
//     }

//     return c.html(
//       <>
//         <Alert type="success" message="Book of the Day set!" />
//         <div id="server_events">
//           <div x-init="$dispatch('book-of-the-day:updated')"></div>
//         </div>
//       </>,
//     );
//   },
// );

adminDashboardRoutes.get(
  "/book-of-the-week/edit/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  async (c) => {
    const bookId = c.req.param("bookId");
    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    const formValues = {
      weekStart: book.bookOfTheWeekEntry?.weekStart
        ? toWeekString(book.bookOfTheWeekEntry?.weekStart)
        : "",
      text: book.bookOfTheWeekEntry?.text,
    };

    return c.html(
      <Modal title="Edit Book of the Week">
        <BookOfTheWeekForm book={book} formValues={formValues} isEditMode />
      </Modal>,
    );
  },
);

adminDashboardRoutes.get(
  "/book-of-the-week/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  async (c) => {
    const bookId = c.req.param("bookId");
    const book = await getBookById(bookId);
    if (!book) {
      return showErrorAlert(c, "Book not found");
    }

    return c.html(
      <Modal title="Set Book of the Week">
        <BookOfTheWeekForm book={book} />
      </Modal>,
    );
  },
);

adminDashboardRoutes.post(
  "/book-of-the-week/:bookId",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  async (c) => {
    const formData = c.req.valid("form");
    const bookId = c.req.valid("param").bookId;

    const bookOfTheWeek = await setBookOfTheWeek({
      weekStart: formData.weekStart,
      bookId: bookId,
      text: formData.text,
    });

    const book = await getBookById(bookId);
    if (!book) return showErrorAlert(c, "Book not found");

    if (!bookOfTheWeek) {
      return c.html(
        <div id="book-of-the-week-errors" class="text-danger text-xs my-2">
          That week already has a book assigned, or this book is already chosen
          for another week.
        </div>,
        422,
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Book of the Week set!" />
        <div id="server_events">
          <div x-init="$dispatch('books:updated')"></div>
        </div>
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/book-of-the-week/edit/:bookId",
  formValidator(bookOfTheWeekFormSchema),
  paramValidator(bookIdSchema),
  requireAdminAccess,
  async (c) => {
    const formData = c.req.valid("form");
    const bookId = c.req.valid("param").bookId;

    const bookOfTheWeek = await updateBookOfTheWeek({
      weekStart: formData.weekStart,
      bookId: bookId,
      text: formData.text,
    });

    const book = await getBookById(bookId);
    if (!book) return showErrorAlert(c, "Book not found");

    if (!bookOfTheWeek) {
      return c.html(
        <div id="book-of-the-week-errors" class="text-danger text-xs my-2">
          That week already has a book assigned, or this book is already chosen
          for another week.
        </div>,
        422,
      );
    }

    return c.html(
      <>
        <Alert type="success" message="Book of the Week edited!" />
        <div id="server_events">
          <div x-init="$dispatch('books:updated')"></div>
        </div>
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/book-of-the-week/delete/:bookId",
  paramValidator(bookIdSchema),
  requireAdminAccess,
  async (c) => {
    const bookId = c.req.valid("param").bookId;
    const book = await getBookById(bookId);
    if (!book) return showErrorAlert(c, "Book not found");
    const deletedBookOfTheWeek = await deleteBookOfTheWeekByIdAdmin(bookId);
    if (!deletedBookOfTheWeek)
      return showErrorAlert(c, "Failed to delete book of the week");
    return c.html(
      <>
        <Alert type="success" message="Book of the Week deleted!" />
        <div id="server_events">
          <div x-init="$dispatch('books:updated')"></div>
        </div>
      </>,
    );
  },
);

adminDashboardRoutes.post(
  "/creators/edit/:creatorId/assign",
  requireAdminAccess,
  paramValidator(creatorIdSchema),
  formValidator(manualAssignCreatorSchema),
  async (c) => {
    const creatorId = c.req.valid("param").creatorId;
    const { email, website } = c.req.valid("form");
    const creator = await getCreatorById(creatorId);
    if (!creator) return showErrorAlert(c, "Creator not found");

    const user = await findUserByEmail(email);
    if (!user) return showErrorAlert(c, "No user found with that email");

    const websiteUrl = website?.trim() || null;

    try {
      await assignCreatorToUserManually(user.id, creatorId, websiteUrl);
    } catch (err) {
      console.error("Manual assign failed:", err);
      return showErrorAlert(c, "Failed to assign creator. Please try again.");
    }
    await setFlash(c, "success", `Creator assigned to ${user.email}`);
    return c.redirect(`/dashboard/admin/creators/edit/${creatorId}`);
  },
);
