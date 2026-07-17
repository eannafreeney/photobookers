import VerifiedCreator from "@/components/app/VerifiedCreator";
import { Creator } from "@/db/schema";

type Props = {
  creator: Creator;
  class?: string;
};

const CreatorAvatar = ({ creator, class: className = "size-16" }: Props) => (
  <div class="relative shrink-0">
    {creator.coverUrl ? (
      <img
        src={creator.coverUrl}
        alt={creator.displayName}
        class={`${className} rounded-full border border-outline object-cover`}
      />
    ) : (
      <span
        class={`flex ${className} items-center justify-center rounded-full border border-outline bg-surface-alt text-lg font-semibold text-on-surface`}
        aria-hidden="true"
      >
        {creator.displayName.charAt(0)}
      </span>
    )}
    <div class="absolute -top-0.5 -right-0.5">
      <VerifiedCreator creatorStatus={creator.status ?? "stub"} size="xs" />
    </div>
  </div>
);

export default CreatorAvatar;
