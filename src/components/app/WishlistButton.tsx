import clsx from "clsx";
import { AuthUser } from "../../../types";
import { findWishlist } from "../../db/queries";
import APIButton from "./APIButton";
import APIButtonCircle from "./APIButtonCircle";

type WishlistButtonProps = {
  bookId: string;
  user: AuthUser | null;
  isCircleButton?: boolean;
  isDisabled?: boolean;
};

const WishlistButton = async ({
  bookId,
  user,
  isCircleButton = false,
  isDisabled = false,
}: WishlistButtonProps) => {
  // Only query if user is logged in, otherwise default to false
  let isWishlisted = false;
  if (user?.id) {
    isWishlisted = !!(await findWishlist(user.id, bookId));
  }

  const id = `wishlist-${bookId}`;
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
    xTarget: id,
    action: `/api/wishlist/${bookId}`,
    errorTarget: `modal-root`,
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

  if (isCircleButton) {
    return (
      <APIButtonCircle {...props} buttonType="circle" isDisabled={isDisabled} />
    );
  }

  return <APIButton {...props} isDisabled={isDisabled} />;
};

export default WishlistButton;

const emptyHeartIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-6 hover:text-red-500"
  >
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
  </svg>
);

const fullHeartIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-6 text-red-500"
  >
    <path d="m11.645 20.91-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.219l-.022.012-.007.004-.003.001a.752.752 0 0 1-.704 0l-.003-.001Z" />
  </svg>
);
