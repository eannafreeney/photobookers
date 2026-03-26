import { AuthUser } from "../../../../types";
import { findCollectionItem } from "../../../db/queries";
import { Book } from "../../../db/schema";
import { canCollectBook } from "../../../lib/permissions";
import APIButton from "./APIButton";
import APIButtonCircle from "./APIButtonCircle";

type CollectButtonProps = {
  book: Pick<Book, "id" | "artistId" | "publisherId">;
  user: AuthUser | null;
  isCircleButton?: boolean;
};

const CollectButton = async ({
  book,
  user,
  isCircleButton = false,
}: CollectButtonProps) => {
  // Only query if user is logged in, otherwise default to false
  let isCollected = false;
  if (user?.id) {
    isCollected = !!(await findCollectionItem(user.id, book.id));
  }

  const id = `collect-${book.id}`;
  const isDisabled = !canCollectBook(user, book);
  const buttonIcon = (
    <>
      {/* Show empty heart when: not wishlisted OR (wishlisted AND submitting) */}
      <span x-show={isCollected ? "isSubmitting" : "!isSubmitting"} x-cloak>
        {addIcon}
      </span>
      {/* Show full heart when: wishlisted OR (!wishlisted AND submitting) */}
      <span x-show={isCollected ? "!isSubmitting" : "isSubmitting"} x-cloak>
        {removeIcon}
      </span>
    </>
  );

  const props = {
    id,
    action: `/api/books/${book.id}/collect`,
    hiddenInput: { name: "isCollected", value: isCollected },
    buttonText: isCircleButton ? (
      buttonIcon
    ) : (
      <>
        <span x-show="!isSubmitting">
          {isCollected ? "Collected" : "Collect"}
        </span>
        <span x-show="isSubmitting" x-cloak>
          {isCollected ? "Collect" : "Collected"}
        </span>
        {buttonIcon}
      </>
    ),
  };

  const tooltipText = isCollected
    ? "Remove from my Collection"
    : "Add to my Collection";

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

export default CollectButton;

const addIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
);

const removeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-5 text-red-500"
  >
    <path d="M5 12h14" />
  </svg>
);
