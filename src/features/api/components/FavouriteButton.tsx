import { AuthUser } from "../../../../types";
import { Book } from "../../../db/schema";
import { emptyHeartIcon, fullHeartIcon } from "../../../lib/icons";
import { canWishlistBook } from "../../../lib/permissions";
import { isOk } from "../../../lib/result";
import { findWishlist } from "../services";
import APIButton from "./APIButton";
import APIButtonCircle from "./APIButtonCircle";

type FavoriteButtonProps = {
  book: Pick<Book, "id" | "artistId" | "publisherId">;
  user: AuthUser | null;
  isCircleButton?: boolean;
};

const FavoriteButton = async ({
  book,
  user,
  isCircleButton = false,
}: FavoriteButtonProps) => {
  // Only query if user is logged in, otherwise default to false
  let isFavorited = false;
  if (user?.id) {
    isFavorited = isOk(await findWishlist(user.id, book.id));
  }

  const id = `favorite-${book.id}`;
  const isDisabled = !canWishlistBook(user, book);
  const buttonIcon = (
    <>
      {/* Show empty heart when: not wishlisted OR (wishlisted AND submitting) */}
      <span x-show={isFavorited ? "isSubmitting" : "!isSubmitting"} x-cloak>
        {emptyHeartIcon()}
      </span>
      {/* Show full heart when: wishlisted OR (!wishlisted AND submitting) */}
      <span x-show={isFavorited ? "!isSubmitting" : "isSubmitting"} x-cloak>
        {fullHeartIcon()}
      </span>
    </>
  );

  const props = {
    id,
    action: `/api/books/${book.id}/wishlist`,
    hiddenInput: { name: "isFavorited", value: isFavorited },
    buttonText: isCircleButton ? (
      buttonIcon
    ) : (
      <>
        <span x-show="!isSubmitting">
          {isFavorited ? "Favorited" : "Favorite"}
        </span>
        <span x-show="isSubmitting" x-cloak>
          {isFavorited ? "Favorite" : "Favorited"}
        </span>
        {buttonIcon}
      </>
    ),
  };

  const tooltipText = isFavorited
    ? "Unfavorite this book"
    : "Favorite this book";

  if (isCircleButton) {
    return (
      <APIButtonCircle
        {...props}
        buttonType="circle"
        isDisabled={isDisabled}
        tooltipText={tooltipText}
      />
    );
  }

  return (
    <APIButton {...props} isDisabled={isDisabled} isActive={isFavorited} />
  );
};

export default FavoriteButton;
