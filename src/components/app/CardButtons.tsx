import WishlistButton from "./WishlistButton";
import CollectionButton from "./CollectionButton";
import { useUser } from "../../contexts/UserContext";
import { Book } from "../../db/schema";

type CardButtonsProps = {
  book: Pick<Book, 'id' | 'artistId' | 'publisherId'>;
};

const CardButtons = ({ book }: CardButtonsProps) => {
  const user = useUser();

  return (
    <div class="flex flex-col md:flex-row items-center gap-2">
      
      <CollectionButton book={book} user={user} />
    </div>
  );
};

export default CardButtons;
