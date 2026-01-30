import APIButton from "./APIButton";
import { AuthUser } from "../../../types";
import { findCollectionItem } from "../../db/queries";
import APIButtonCircle from "./APIButtonCircle";

type Props = {
  bookId: string;
  user: AuthUser | null;
  isCircleButton?: boolean;
};
const CollectionButton = async ({
  bookId,
  user,
  isCircleButton = false,
}: Props) => {
  let isInCollection = false;
  if (user?.id) {
    isInCollection = !!(await findCollectionItem(user.id, bookId));
  }

  const id = `collection-${bookId}`;
  const buttonIcon = isInCollection
    ? addToCollectionIcon
    : removeFromCollectionIcon;

  const props = {
    id,
    xTarget: id,
    action: `/api/collection/${bookId}`,
    errorTarget: `modal-root`,
    hiddenInput: { name: "isInCollection", value: isInCollection },
    buttonText: isCircleButton ? (
      buttonIcon
    ) : (
      <>
        <span>{isInCollection ? "In My Collection" : "Add to Collection"}</span>
        {buttonIcon}
      </>
    ),
  };

  if (isCircleButton) {
    return <APIButtonCircle {...props} buttonType="circle" />;
  }

  return <APIButton {...props} />;
};

export default CollectionButton;

const removeFromCollectionIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6 hover:text-primary hover:fill-primary"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);

const addToCollectionIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6 text-primary fill-primary"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);
