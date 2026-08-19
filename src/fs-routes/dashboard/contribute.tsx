import { createRoute } from "hono-fsr";
import { getUser, setFlash } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import MemberDashboardShell from "../../features/dashboard/components/MemberDashboardShell";
import { BookForm } from "../../features/dashboard/books/forms/BookForm";
import { bookFormSchema } from "../../features/dashboard/books/schema";
import { limitBooksPerDay } from "../../middleware/booksPerDayLimit";
import { formValidator } from "../../lib/validator";
import { BookFormContext } from "../../features/dashboard/books/types";
import { showErrorAlert } from "../../lib/alertHelpers";
import {
  resolveArtist,
  resolvePublisher,
} from "../../features/dashboard/admin/creators/services";
import {
  buildCreateBookData,
  createBook,
  getNewBookModerationForUser,
} from "../../features/dashboard/books/services";
import { serializePressLinks } from "../../features/dashboard/books/pressLinks";
import Link from "../../components/app/Link";
import Table from "../../components/app/Table";
import EditRowButton from "../../features/app/components/EditRowButton";
import DeleteRowButton from "../../features/app/components/DeleteRowButton";
import BookApprovalStatusPill from "../../features/dashboard/admin/books/components/BookApprovalStatusPill";
import {
  getSubmittedBooksByUserId,
  type SubmittedBook,
} from "../../domain/contributors/services";

function canContributorEdit(book: SubmittedBook): boolean {
  return (
    book.artist?.status !== "verified" && book.publisher?.status !== "verified"
  );
}

const SubmissionRow = ({ book }: { book: SubmittedBook }) => {
  const editable = canContributorEdit(book);
  return (
    <tr class="border-b border-outline">
      <td class="p-4">
        {book.coverUrl ? (
          <img
            src={book.coverUrl}
            alt={book.title}
            class="h-12 w-9 rounded object-cover"
          />
        ) : (
          <div class="h-12 w-9 rounded bg-surface-alt" />
        )}
      </td>
      <td class="p-4 font-medium text-on-surface-strong">{book.title}</td>
      <td class="p-4 text-on-surface-weak">
        {book.artist?.displayName ?? "—"}
      </td>
      <td class="p-4 text-on-surface-weak">
        {book.publisher?.displayName ?? "—"}
      </td>
      <td class="p-4">
        <BookApprovalStatusPill
          approvalStatus={book.approvalStatus ?? "pending"}
        />
      </td>
      <td class="p-4">
        {editable ? (
          <div class="flex items-center gap-2">
            <EditRowButton href={`/dashboard/books/${book.id}`} />
            <DeleteRowButton
              action={`/dashboard/books/${book.id}`}
              confirm={`Delete "${book.title}"?`}
            />
          </div>
        ) : null}
      </td>
    </tr>
  );
};

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const formValues = { press_links: serializePressLinks([]) };
  const contributions = await getSubmittedBooksByUserId(user.id);

  return c.html(
    <AppLayout title="Contribute a Book" user={user} currentPath={currentPath}>
      <MemberDashboardShell user={user} currentPath={currentPath}>
        <div class="flex flex-col gap-2 border-b-2 border-on-surface-strong pb-6 mb-6">
          <span class="kicker text-accent">Contribute</span>
          <h1 class="font-display text-3xl md:text-4xl font-medium leading-tight text-on-surface-strong">
            Add a book to the catalog
          </h1>
          <p class="max-w-2xl text-sm md:text-base text-on-surface text-pretty">
            Know a photobook that's missing? Add it here and upload a cover
            image. Every book is reviewed before it goes live. You'll be
            credited in the colophon and appear on the{" "}
            <Link href="/leaderboard" hoverUnderline>
              contributor leaderboard
            </Link>
            .
          </p>
        </div>
        <BookForm
          action="/dashboard/contribute"
          isPublisher={false}
          isContributor={true}
          primaryAction="save"
          formValues={formValues}
        />
        {contributions.length > 0 && (
          <div class="mt-12">
            <h2 class="font-display text-xl font-medium text-on-surface-strong mb-4">
              Your contributions
            </h2>
            <Table>
              <Table.Head>
                <tr>
                  <Table.HeadRow>Cover</Table.HeadRow>
                  <Table.HeadRow>Title</Table.HeadRow>
                  <Table.HeadRow>Artist</Table.HeadRow>
                  <Table.HeadRow>Publisher</Table.HeadRow>
                  <Table.HeadRow>Approval</Table.HeadRow>
                  <Table.HeadRow>
                    <span class="sr-only">Actions</span>
                  </Table.HeadRow>
                </tr>
              </Table.Head>
              <Table.Body>
                {contributions.map((book) => (
                  <SubmissionRow key={book.id} book={book} />
                ))}
              </Table.Body>
            </Table>
          </div>
        )}
      </MemberDashboardShell>
    </AppLayout>,
  );
});

export const POST = createRoute(
  limitBooksPerDay,
  formValidator(bookFormSchema),
  async (c: BookFormContext) => {
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
      moderation,
    );
    (bookData as any).submittedByUserId = user.id;

    const newBook = await createBook(bookData);
    if (!newBook) return showErrorAlert(c, "Failed to create book");

    await setFlash(
      c,
      "success",
      `"${newBook.title}" saved! Now add a cover image, then submit for review.`,
    );
    return c.redirect(`/dashboard/books/${newBook.id}?tab=images`);
  },
);
