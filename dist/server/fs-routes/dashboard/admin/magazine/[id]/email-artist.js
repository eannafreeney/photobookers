import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import {
  formValidator,
  paramValidator,
  queryValidator
} from "../../../../../lib/validator.js";
import { idSchema } from "../../../../../features/app/schema.js";
import {
  magazineEmailArtistQuerySchema,
  magazineEmailArtistSchema
} from "../../../../../features/dashboard/admin/magazine/schema.js";
import {
  getIssueByIdForAdmin
} from "../../../../../domain/magazine/queries.js";
import {
  saveCreatorEmail,
  stampArtistEmailSent,
  updateIssueBookArtistPrompt
} from "../../../../../domain/magazine/mutations.js";
import {
  formatRevealDate,
  generateMagazineArtistPromptEmail,
  magazineArtistPromptEmailSubject,
  magazineSiteUrl
} from "../../../../../features/dashboard/admin/magazine/emails.js";
import { sendEmail } from "../../../../../lib/sendEmail.js";
import IssueBookCard from "../../../../../features/dashboard/admin/magazine/components/IssueBookCard.js";
import ArtistEmailModal from "../../../../../features/dashboard/admin/magazine/components/ArtistEmailModal.js";
import Alert from "../../../../../components/app/Alert.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
const resolvePlacement = (issue, bookId) => {
  const placement = issue.placements.find((p) => p.bookId === bookId);
  if (!placement) return { error: "Book is not in this issue." };
  if (placement.artistEmailSentAt) {
    return { error: "This artist has already been emailed." };
  }
  const artist = placement.book?.artist ?? null;
  if (!artist) return { error: "This book has no artist." };
  return { placement, artist };
};
const GET = createRoute(
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
      /* @__PURE__ */ jsx(
        ArtistEmailModal,
        {
          action: `/dashboard/admin/magazine/${id}`,
          bookId,
          targetId: `magazine-book-${resolved.placement.number}`,
          recipientEmail: resolved.artist.email?.trim() || null,
          subject: magazineArtistPromptEmailSubject(issue.title),
          prompt: resolved.placement.artistPrompt ?? "",
          dayNumber: resolved.placement.number
        }
      )
    );
  }
);
const POST = createRoute(
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
      return showErrorAlert(c, "No email for this artist \u2014 add one to send.");
    }
    if (provided && provided !== artist.email) {
      const [saveErr] = await saveCreatorEmail(artist.id, provided);
      if (saveErr) return showErrorAlert(c, saveErr.reason);
    }
    const finalPrompt = prompt?.trim() || null;
    if (finalPrompt !== placement.artistPrompt) {
      const [promptErr] = await updateIssueBookArtistPrompt(
        id,
        bookId,
        finalPrompt
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
      revealDate: formatRevealDate(revealDate)
    });
    const subjectLine = subject?.trim() || magazineArtistPromptEmailSubject(issue.title);
    const [emailErr] = await sendEmail(recipient, subjectLine, html);
    if (emailErr) return showErrorAlert(c, emailErr.reason);
    const [stampErr, sentAt] = await stampArtistEmailSent(id, bookId);
    if (stampErr) return showErrorAlert(c, stampErr.reason);
    const action = `/dashboard/admin/magazine/${id}`;
    return c.html(
      /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(
          IssueBookCard,
          {
            number: placement.number,
            bookId: placement.bookId,
            book: placement.book,
            blurb: placement.blurb,
            action,
            selectedImageUrl: placement.selectedImageUrl,
            artistPrompt: finalPrompt,
            artistQuote: placement.artistQuote,
            artistEmailSentAt: sentAt
          }
        ),
        /* @__PURE__ */ jsx(Alert, { type: "success", message: `Emailed ${recipient}.` })
      ] })
    );
  }
);
export {
  GET,
  POST
};
