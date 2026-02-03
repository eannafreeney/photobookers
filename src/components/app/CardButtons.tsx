import WishlistButton from "./WishlistButton";
import CollectionButton from "./CollectionButton";
import { useUser } from "../../contexts/UserContext";
import { Book } from "../../db/schema";

type CardButtonsProps = {
  book: Book;
};

const CardButtons = ({ book }: CardButtonsProps) => {
  const user = useUser();
  return (
    <div class="flex flex-col md:flex-row items-center gap-2">
      <WishlistButton book={book} user={user} />
      <CollectionButton book={book} user={user} />
    </div>
  );
};

export default CardButtons;
