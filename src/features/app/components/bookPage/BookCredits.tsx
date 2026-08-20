import { formatDate } from "../../../../utils";
import { BookSubmitter } from "../../types";

type CreditsProps = {
  releaseDate: Date | null;
  submittedByUser?: BookSubmitter;
};

function submitterDisplayName(user: BookSubmitter): string | null {
  if (!user) return null;
  const parts = [user.firstName, user.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(" ") : null;
}

const Credits = ({ releaseDate, submittedByUser }: CreditsProps) => {
  const submitterName = submitterDisplayName(submittedByUser ?? null);

  return (
    <div class="flex flex-col border-t-2 border-on-surface-strong">
      <span class="kicker text-accent pt-3 pb-2">Colophon</span>
      {releaseDate && (
        <div class="flex items-baseline justify-between gap-4 border-t border-outline py-2">
          <span class="kicker text-on-surface-weak">Released</span>
          <span class="text-sm text-on-surface-strong">
            {formatDate(releaseDate)}
          </span>
        </div>
      )}
      {submitterName && (
        <div class="flex items-baseline justify-between gap-4 border-t border-outline py-2">
          <span class="kicker text-on-surface-weak">Added by</span>
          <span class="text-sm text-on-surface-strong">
            {submittedByUser?.shelfSlug ? (
              <a
                href={`/shelf/${submittedByUser.shelfSlug}?tab=contributions`}
                class="underline hover:text-accent"
              >
                {submitterName}
              </a>
            ) : (
              submitterName
            )}
          </span>
        </div>
      )}
      <div class="flex items-baseline justify-between gap-4 border-t border-outline py-2">
        <span class="kicker text-on-surface-weak">Credits</span>
        <span class="text-sm text-on-surface text-right max-w-xs">
          All images on this page are owned by the respective creator.
        </span>
      </div>
    </div>
  );
};

export default Credits;
