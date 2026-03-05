import Link from "./Link";
import Avatar from "./Avatar";
import Card from "./Card";
import VerifiedCreator from "./VerifiedCreator";
import { CreatorCardResult } from "../../constants/queries";

type CardCreatorCardProps = {
  creator: CreatorCardResult | null;
  avatarSize?: "xs" | "sm" | "md" | "lg";
};

const CardCreatorCard = async ({
  creator,
  avatarSize = "xs",
}: CardCreatorCardProps) => {
  if (!creator) return <></>;

  return (
    <Link href={`/creators/${creator.slug}`}>
      <div class="flex items-center gap-2">
        <div class="relative">
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            size={avatarSize}
          />
          <div class="absolute -top-1 -right-1">
            <VerifiedCreator creatorStatus={creator.status} size="xs" />
          </div>
        </div>
        <Card.SubTitle>{creator.displayName}</Card.SubTitle>
      </div>
    </Link>
  );
};

export default CardCreatorCard;
