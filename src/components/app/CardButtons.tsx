import WishlistButton from "./WishlistButton";
import CollectionButton from "./CollectionButton";
import { useUser } from "../../contexts/UserContext";

type CardButtonsProps = {
  bookId: string;
};

const CardButtons = ({ bookId }: CardButtonsProps) => {
  const user = useUser();
  return (
    <div class="flex flex-col items-center gap-2">
      <WishlistButton bookId={bookId} user={user} />
      <CollectionButton bookId={bookId} user={user} />
    </div>
  );
};

export default CardButtons;
