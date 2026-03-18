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
    <div class="flex items-center gap-2">
      <div class="relative">
        <Link href={`/creators/${creator.slug}`}>
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={displayName}
            size={avatarSize}
          />
        </Link>
        <div class="absolute -top-1 -right-1">
          <VerifiedCreator creatorStatus={creator.status} size="xs" />
        </div>
      </div>
      <Link href={`/creators/${creator.slug}`}>
        <Card.SubTitle title={creator.displayName}>{displayName}</Card.SubTitle>
      </Link>
    </div>
  );
};

export default CardCreatorCard;
