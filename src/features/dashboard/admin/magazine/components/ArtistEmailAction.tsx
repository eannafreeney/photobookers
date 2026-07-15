import Button from "@/components/app/Button";
import Link from "@/components/app/Link";

type Props = {
  /** Base issue action path, e.g. `/dashboard/admin/magazine/{id}`. */
  action: string;
  bookId: string;
  artistPrompt: string | null;
  artistEmailSentAt: Date | string | null;
};

const formatSent = (value: Date | string): string => {
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Emails the artist their editorial question. Once sent it locks to a "sent"
// line (resend is intentionally blocked). The button fetches a preview modal
// (GET) where the message can be edited before sending — see ArtistEmailModal.
const ArtistEmailAction = ({
  action,
  bookId,
  artistPrompt,
  artistEmailSentAt,
}: Props) => {
  if (artistEmailSentAt) {
    return (
      <p class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#4f7a4a]">
        ✓ Question emailed {formatSent(artistEmailSentAt)}
      </p>
    );
  }

  if (!artistPrompt) {
    return (
      <p class="mt-1 text-xs italic text-on-surface-weak">
        No artist question set — add one before emailing.
      </p>
    );
  }

  const previewHref = `${action}/email-artist?bookId=${encodeURIComponent(bookId)}`;

  return (
    <Link href={previewHref} xTarget="modal-root">
      <Button variant="outline" color="primary" width="auto">
        Email question to artist…
      </Button>
    </Link>
  );
};

export default ArtistEmailAction;
