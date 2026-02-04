import Link from "./Link"
import Avatar from "./Avatar"
import { Book, Creator } from "../../db/schema"
import Card from "./Card";
import { getCreatorById } from "../../services/creators";

type CardCreatorCardProps = {
  creatorType?: "publisher" | "artist";
  book: Book;
}

const CardCreatorCard = async ({ creatorType, book }: CardCreatorCardProps) => {

    let creatorId: string | null = null;
  
    if (creatorType === "publisher") {
        // On publisher page: show the artist
        creatorId = book.artistId;
      } else if (creatorType === "artist") {
        // On artist page: show publisher, or fallback to artist if self-published
        creatorId = book.publisherId ?? book.artistId;
      } else {
        // default to artist
        creatorId =  book.artistId;
      }

  const creator =  await getCreatorById(creatorId ?? "");

  return (
    <Link href={`/creators/${creator?.slug}`}>
    <div class="flex items-center gap-2"> 
      <Avatar
        src={creator?.coverUrl ?? ""}
        alt={creator?.displayName ?? ""}
        size="xs"
        />
      <Card.SubTitle>{creator?.displayName}</Card.SubTitle>
    </div>
  </Link>
  )
}

export default CardCreatorCard