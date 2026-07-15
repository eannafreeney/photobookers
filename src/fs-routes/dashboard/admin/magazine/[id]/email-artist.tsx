import { createRoute } from "hono-fsr";
import { formValidator, paramValidator } from "@/lib/validator";
import { idSchema } from "@/features/app/schema";
import { magazineEmailArtistSchema } from "@/features/dashboard/admin/magazine/schema";
import { getIssueByIdForAdmin } from "@/domain/magazine/queries";
import {
  saveCreatorEmail,
  stampArtistEmailSent,
} from "@/domain/magazine/mutations";
import {
  generateMagazineArtistPromptEmail,
  magazineSiteUrl,
} from "@/features/dashboard/admin/magazine/emails";
import { sendEmail } from "@/lib/sendEmail";
import MovementBookCard from "@/features/dashboard/admin/magazine/components/MovementBookCard";
import Alert from "@/components/app/Alert";
import { showErrorAlert } from "@/lib/alertHelpers";

export const POST = createRoute(
  paramValidator(idSchema),
  formValidator(magazineEmailArtistSchema),
  async (c) => {
    const id = c.req.valid("param").id;
    const { bookId, email } = c.req.valid("form");

    const [loadErr, issue] = await getIssueByIdForAdmin(id);
    if (loadErr || !issue) {
      return showErrorAlert(c, loadErr?.reason ?? "Issue not found");
    }

    const placement = issue.placements.find((p) => p.bookId === bookId);
    if (!placement) return showErrorAlert(c, "Book is not in this issue.");
    if (placement.artistEmailSentAt) {
      return showErrorAlert(c, "This artist has already been emailed.");
    }

    const artist = placement.book?.artist ?? null;
    const prompt = placement.artistPrompt?.trim();
    if (!prompt) {
      return showErrorAlert(c, "Add an artist question before emailing.");
    }
    if (!artist) return showErrorAlert(c, "This book has no artist.");

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

    const html = generateMagazineArtistPromptEmail({
      artistName: artist.displayName ?? "there",
      bookTitle: placement.book?.title ?? "your book",
      issueTitle: issue.title,
      issueKicker: issue.kicker,
      artistPrompt: prompt,
      bookUrl: `${magazineSiteUrl()}/books/${bookId}`,
    });

    const [emailErr] = await sendEmail(
      recipient,
      `Your book has been selected for ${issue.title}`,
      html,
    );
    if (emailErr) return showErrorAlert(c, emailErr.reason);

    const [stampErr, sentAt] = await stampArtistEmailSent(id, bookId);
    if (stampErr) return showErrorAlert(c, stampErr.reason);

    // Swap the card in place so it locks to its "sent" state.
    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      <>
        <MovementBookCard
          number={placement.number}
          bookId={placement.bookId}
          book={placement.book}
          blurb={placement.blurb}
          action={action}
          artistPrompt={placement.artistPrompt}
          artistEmailSentAt={sentAt}
        />
        <Alert type="success" message={`Question emailed to ${recipient}.`} />
      </>,
    );
  },
);
