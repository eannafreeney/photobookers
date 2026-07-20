import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator,
  queryValidator,
} from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import {
  magazineEmailArtistQuerySchema,
  magazineEmailArtistSchema,
} from "@/features/dashboard/admin/magazine/schema";
import {
  getIssueByIdForAdmin,
  MagazineIssueView,
} from "@/domain/magazine/queries";
import {
  saveCreatorEmail,
  stampArtistEmailSent,
  updateIssueBookArtistPrompt,
} from "@/domain/magazine/mutations";
import {
  formatRevealDate,
  generateMagazineArtistPromptEmail,
  magazineArtistPromptEmailSubject,
  magazineSiteUrl,
} from "@/features/dashboard/admin/magazine/emails";
import { sendEmail } from "@/lib/sendEmail";
import IssueBookCard from "@/features/dashboard/admin/magazine/components/IssueBookCard";
import ArtistEmailModal from "@/features/dashboard/admin/magazine/components/ArtistEmailModal";
import Alert from "@/components/app/Alert";
import { showErrorAlert } from "@/lib/alertHelpers";

// Validates that the book is an unsent placement with an artist, returning the
// pieces both handlers need, or a user-facing error string.
const resolvePlacement = (issue: MagazineIssueView, bookId: string) => {
  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return { error: "Book is not in this issue." as const };
  if (placement.artistEmailSentAt) {
    return { error: "This artist has already been emailed." as const };
  }
  const artist = placement.book?.artist ?? null;
  if (!artist) return { error: "This book has no artist." as const };
  return { placement, artist };
};

// Returns the preview/edit modal with the message about to be sent.
export const GET = createRoute(
  paramValidator(idSchema),
  queryValidator(magazineEmailArtistQuerySchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId } = c.req.valid("query");

    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }

    const resolved = resolvePlacement(issue, bookId);
    if ("error" in resolved) return showErrorAlert(c, resolved.error);

    return c.html(
      <ArtistEmailModal
        action={`/dashboard/admin/magazine/${id}`}
        bookId={bookId}
        targetId={`magazine-book-${resolved.placement.number}`}
        recipientEmail={resolved.artist.email?.trim() || null}
        subject={magazineArtistPromptEmailSubject(issue.title)}
        prompt={resolved.placement.artistPrompt ?? ""}
        dayNumber={resolved.placement.number}
      />,
    );
  },
);

export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineEmailArtistSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId, email, subject, prompt, revealDate } = c.req.valid("form");

    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }

    const resolved = resolvePlacement(issue, bookId);
    if ("error" in resolved) return showErrorAlert(c, resolved.error);
    const { placement, artist } = resolved;

    const provided = email?.trim();
    const recipient = provided || artist.email?.trim();
    if (!recipient) {
      return showErrorAlert(c, "No email for this artist — add one to send.");
    }

    // A newly-entered address is persisted to the artist's account.
    if (provided && provided !== artist.email) {
      const [saveErr] = await saveCreatorEmail(artist.id, provided);
      if (saveErr) return showErrorAlert(c, saveErr.reason);
    }

    // Use the edited question (falling back to the stored one), persist it if it
    // changed, and rebuild the email body around it.
    const finalPrompt = prompt?.trim() || placement.artistPrompt?.trim();
    if (!finalPrompt) {
      return showErrorAlert(c, "Add an artist question before emailing.");
    }
    if (finalPrompt !== placement.artistPrompt) {
      const [promptErr] = await updateIssueBookArtistPrompt(
        id,
        bookId,
        finalPrompt,
      );
      if (promptErr) return showErrorAlert(c, promptErr.reason);
    }

    const coverUrl = placement.selectedImageUrl ?? placement.book?.coverUrl ?? null;
    const html = generateMagazineArtistPromptEmail({
      artistName: artist.displayName ?? "there",
      bookTitle: placement.book?.title ?? "your book",
      issueTitle: issue.title,
      issueKicker: issue.kicker,
      issueNumber: issue.issueNumber,
      artistPrompt: finalPrompt,
      bookUrl: `${magazineSiteUrl()}/books/${bookId}`,
      issueUrl: `${magazineSiteUrl()}/magazine/${issue.slug}`,
      coverUrl,
      revealDate: formatRevealDate(revealDate),
    });

    const subjectLine =
      subject?.trim() || magazineArtistPromptEmailSubject(issue.title);

    const [emailErr] = await sendEmail(recipient, subjectLine, html);
    if (emailErr) return showErrorAlert(c, emailErr.reason);

    const [stampErr, sentAt] = await stampArtistEmailSent(id, bookId);
    if (stampErr) return showErrorAlert(c, stampErr.reason);

    // Swap the card in place so it locks to its "sent" state.
    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      <>
        <IssueBookCard
          number={placement.number}
          bookId={placement.bookId}
          book={placement.book}
          blurb={placement.blurb}
          action={action}
          selectedImageUrl={placement.selectedImageUrl}
          artistPrompt={finalPrompt}
          artistQuote={placement.artistQuote}
          artistEmailSentAt={sentAt}
        />
        <Alert type="success" message={`Question emailed to ${recipient}.`} />
      </>,
    );
  },
);
