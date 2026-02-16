import Link from "./Link";
import Avatar from "./Avatar";
import { Book } from "../../db/schema";
import Card from "./Card";
import { getCreatorById } from "../../services/creators";
import VerifiedCreator from "./VerifiedCreator";

type CardCreatorCardProps = {
  creatorType?: "publisher" | "artist";
  book: Book;
};

const CardCreatorCard = async ({ creatorType, book }: CardCreatorCardProps) => {
  let creatorId: string | null = null;

  if (creatorType === "publisher") {
    creatorId = book.artistId;
  } else if (creatorType === "artist") {
    creatorId = book.publisherId; // can be null → self-published
  } else {
    creatorId = book.artistId;
  }

  const creator = creatorId ? await getCreatorById(creatorId) : null;

  return creator ? (
    <Link href={`/creators/${creator.slug}`}>
      <div class="flex items-center gap-1">
        <Avatar
          src={creator.coverUrl ?? ""}
          alt={creator.displayName ?? ""}
          size="xs"
        />
        <Card.SubTitle>{creator.displayName}</Card.SubTitle>
        <VerifiedCreator creator={creator} size="xs" />
      </div>
    </Link>
  ) : (
    <Card.SubTitle>Self Published</Card.SubTitle>
  );
};

export default CardCreatorCard;
