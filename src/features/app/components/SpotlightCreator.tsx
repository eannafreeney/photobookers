import VerificationBadge from "@/components/app/VerificationBadge";
import { CreatorCardResult } from "../../../constants/queries";

type Props = {
  creator: CreatorCardResult | null | undefined;
  role: string;
  truncateName?: boolean;
  isVerified?: boolean;
};

const SpotlightCreator = ({
  creator,
  role,
  truncateName = true,
  isVerified = false,
}: Props) => {
  if (!creator) return <></>;
  return (
    <div class="flex items-center gap-3">
      {creator.coverUrl ? (
        <div class="relative">
          <img
            src={creator.coverUrl}
            alt={creator.displayName}
            class="size-12 shrink-0 rounded-full border border-outline object-cover"
          />
          {isVerified && (
            <div class="absolute top-0 right-0">
              <VerificationBadge creatorStatus="verified" size="xs" />
            </div>
          )}
        </div>
      ) : (
        <span
          class="flex size-12 shrink-0 items-center justify-center rounded-full border border-outline bg-surface-alt text-sm font-semibold text-on-surface"
          aria-hidden="true"
        >
          {creator.displayName.charAt(0)}
        </span>
      )}
      <div class="min-w-0">
        <p class="kicker text-accent">{role}</p>
        <p class="truncate font-display text-lg font-medium text-on-surface-strong">
          {truncateName && creator.displayName.length > 18
            ? creator.displayName.slice(0, 18) + "..."
            : creator.displayName}
        </p>
      </div>
    </div>
  );
};

export default SpotlightCreator;
