import Link from "./Link";
import Avatar from "./Avatar";
import Card from "./Card";
import VerifiedCreator from "./VerifiedCreator";
import { CreatorCardResult } from "../../constants/queries";
import { truncate } from "../../lib/utils";

type CardCreatorCardProps = {
  creator: CreatorCardResult | null;
  avatarSize?: "xs" | "sm" | "md" | "lg";
  maxDisplayNameLength?: number;
};

const CardCreatorCard = async ({
  creator,
  avatarSize = "xs",
  maxDisplayNameLength,
}: CardCreatorCardProps) => {
  if (!creator) return <></>;

  const displayName =
    maxDisplayNameLength != null
      ? truncate(creator.displayName, maxDisplayNameLength)
      : (creator.displayName ?? "");

  return (
    <div class="flex min-w-0 items-center gap-2">
      <Link href={`/creators/${creator.slug}`} className="shrink-0">
        <Avatar
          src={creator.coverUrl ?? ""}
          alt={displayName}
          size={avatarSize}
        />
      </Link>
      <div class="flex min-w-0 items-center gap-1">
        <Link
          href={`/creators/${creator.slug}`}
          className="min-w-0 truncate"
          title={creator.displayName}
        >
          <Card.SubTitle title={displayName}>{displayName}</Card.SubTitle>
        </Link>
        <div class="shrink-0">
          <VerifiedCreator creatorStatus={creator.status} size="xs" />
        </div>
      </div>
    </div>
  );
};

export default CardCreatorCard;
