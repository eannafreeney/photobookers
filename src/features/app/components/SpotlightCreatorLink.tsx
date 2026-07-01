import { CreatorCardResult } from "../../../constants/queries";
import Button from "../../../components/app/Button";

type Props = {
  creator: CreatorCardResult | null | undefined;
  role: string;
};

const SpotlightCreatorLink = async ({ creator, role }: Props) => {
  if (!creator) return <></>;

  return (
    <div class="flex items-center justify-between gap-3 border-y border-outline py-4">
      <div class="flex items-center gap-3">
        {creator.coverUrl ? (
          <img
            src={creator.coverUrl}
            alt={creator.displayName}
            class="size-12 shrink-0 rounded-full border border-outline object-cover"
          />
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
            {creator.displayName.length > 18
              ? creator.displayName.slice(0, 18) + "..."
              : creator.displayName}
          </p>
        </div>
      </div>

      <a href={`/creators/${creator.slug}`}>
        <Button variant="outline" color="primary" width="full">
          Visit
        </Button>
      </a>
    </div>
  );
};

export default SpotlightCreatorLink;
