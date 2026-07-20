import Button from "@/components/app/Button";
import Link from "@/components/app/Link";

type Props = {
  /** Base issue action path, e.g. `/dashboard/admin/magazine/{id}`. */
  action: string;
  bookId: string;
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

// Emails the artist about their feature — an optional editorial question plus a
// launch share kit. Once sent it locks to a "sent" line (resend is intentionally
// blocked). The button fetches a preview modal (GET) where the message can be
// edited before sending — see ArtistEmailModal.
const ArtistEmailAction = ({
  action,
  bookId,
  artistEmailSentAt,
}: Props) => {
  if (artistEmailSentAt) {
    return (
      <p class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-[#4f7a4a]">
        ✓ Emailed {formatSent(artistEmailSentAt)}
      </p>
    );
  }

  const previewHref = `${action}/email-artist?bookId=${encodeURIComponent(bookId)}`;

  return (
    <Link href={previewHref} xTarget="modal-root">
      <Button variant="outline" color="primary" width="auto">
        Email artist…
      </Button>
    </Link>
  );
};

export default ArtistEmailAction;
