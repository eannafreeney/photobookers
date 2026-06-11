import { formatDate } from "../../../utils";

type CreditsProps = {
  releaseDate: Date | null;
};

const Credits = ({ releaseDate }: CreditsProps) => (
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
    <div class="flex items-baseline justify-between gap-4 border-t border-outline py-2">
      <span class="kicker text-on-surface-weak">Credits</span>
      <span class="text-sm text-on-surface text-right max-w-xs">
        All images on this page are owned by the respective creator.
      </span>
    </div>
  </div>
);

export default Credits;
