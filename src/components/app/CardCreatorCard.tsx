import Link from "./Link";
import Avatar from "./Avatar";
import { Book } from "../../db/schema";
import Card from "./Card";
import { getCreatorById } from "../../services/creators";
import VerifiedCreator from "./VerifiedCreator";

type CardCreatorCardProps = {
  creatorType?: "publisher" | "artist";
  book: Book;
  avatarSize?: "xs" | "sm" | "md" | "lg";
};

const CardCreatorCard = async ({
  creatorType,
  book,
  avatarSize = "xs",
}: CardCreatorCardProps) => {
  let creatorId: string | null = null;

  if (creatorType === "publisher") {
    creatorId = book.publisherId;
  } else {
    creatorId = book.artistId;
  }

  const creator = creatorId ? await getCreatorById(creatorId) : null;

  if (!creator) {
    return <></>;
  }

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
            {creator?.ownerUserId && (
              <VerifiedCreator creator={creator} size="xs" />
            )}
          </div>
        </div>
        <Card.SubTitle>{creator.displayName}</Card.SubTitle>
      </div>
    </Link>
  );
};

export default CardCreatorCard;
