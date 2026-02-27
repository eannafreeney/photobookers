import { AuthUser } from "../../../../types";
import { Book } from "../../../db/schema";
import { emptyHeartIcon, fullHeartIcon } from "../../../lib/icons";
import { canWishlistBook } from "../../../lib/permissions";
import { findWishlist } from "../services";
import APIButton from "./APIButton";
import APIButtonCircle from "./APIButtonCircle";

type WishlistButtonProps = {
  book: Pick<Book, "id" | "artistId" | "publisherId">;
  user: AuthUser | null;
  isCircleButton?: boolean;
};

const WishlistButton = async ({
  book,
  user,
  isCircleButton = false,
}: WishlistButtonProps) => {
  // Only query if user is logged in, otherwise default to false
  let isWishlisted = false;
  if (user?.id) {
    isWishlisted = !!(await findWishlist(user.id, book.id));
  }

  const id = `wishlist-${book.id}`;
  const isDisabled = !canWishlistBook(user, book);
  const buttonIcon = (
    <>
      {/* Show empty heart when: not wishlisted OR (wishlisted AND submitting) */}
      <span x-show={isWishlisted ? "isSubmitting" : "!isSubmitting"} x-cloak>
        {emptyHeartIcon}
      </span>
      {/* Show full heart when: wishlisted OR (!wishlisted AND submitting) */}
      <span x-show={isWishlisted ? "!isSubmitting" : "isSubmitting"} x-cloak>
        {fullHeartIcon}
      </span>
    </>
  );

  const props = {
    id,
    action: `/api/wishlist/${book.id}`,
    hiddenInput: { name: "isWishlisted", value: isWishlisted },
    buttonText: isCircleButton ? (
      buttonIcon
    ) : (
      <>
        <span x-show="!isSubmitting">
          {isWishlisted ? "Wishlisted" : "Wishlist"}
        </span>
        <span x-show="isSubmitting" x-cloak>
          {isWishlisted ? "Wishlist" : "Wishlisted"}
        </span>
        {buttonIcon}
      </>
    ),
  };

  const tooltipText = isWishlisted ? "Remove from Wishlist" : "Add to Wishlist";

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

  return <APIButton {...props} isDisabled={isDisabled} />;
};

export default WishlistButton;
