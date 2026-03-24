import Link from "./Link";
import Avatar from "./Avatar";
import Card from "./Card";
import VerifiedCreator from "./VerifiedCreator";
import { CreatorCardResult } from "../../constants/queries";
import { truncate } from "../../lib/utils";
import { AuthUser } from "../../../types";

type CardCreatorCardProps = {
  creator: CreatorCardResult | null;
  user: AuthUser | null;
  avatarSize?: "xs" | "sm" | "md" | "lg";
  maxDisplayNameLength?: number;
};

const CardCreatorCard = async ({
  creator,
  user,
  avatarSize = "xs",
  maxDisplayNameLength,
}: CardCreatorCardProps) => {
  if (!creator) return <></>;

  const avatarUrl = creator.coverUrl ?? user?.profileImageUrl ?? null;
  const name =  creator.displayName ?? `${user?.firstName} ${user?.lastName}`;

  const displayName =
    maxDisplayNameLength != null
      ? truncate(name , maxDisplayNameLength)
      : (name ?? "");

  return (
    <div class="flex items-center gap-2">
      <div class="relative">
        <Link href={`/creators/${creator.slug}`}>
          <Avatar
            src={avatarUrl ?? ""}
            alt={displayName}
            size={avatarSize}
          />
        </Link>
        <div class="absolute -top-1 -right-1">
          <VerifiedCreator creatorStatus={creator.status} size="xs" />
        </div>
      </div>
      <Link href={`/creators/${creator.slug}`}>
        <Card.SubTitle title={displayName}>{displayName}</Card.SubTitle>
      </Link>
    </div>
  );
};

export default CardCreatorCard;
