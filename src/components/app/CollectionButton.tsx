import APIButton from "./APIButton";
import { AuthUser } from "../../../types";
import { findCollectionItem } from "../../db/queries";
import APIButtonCircle from "./APIButtonCircle";
import { Book } from "../../db/schema";
import { canAddToCollection } from "../../lib/permissions";

type Props = {
  book: Pick<Book, 'id' | 'artistId' | 'publisherId'>;
  user: AuthUser | null;
  isCircleButton?: boolean;
};
const CollectionButton = async ({
  book,
  user,
  isCircleButton = false,
}: Props) => {
  let isInCollection = false;
  if (user?.id) {
    isInCollection = !!(await findCollectionItem(user.id, book.id));
  }

  const id = `collection-${book.id}`;
  const isDisabled = !canAddToCollection(user, book);
  const buttonIcon = (
    <>
      {/* Show empty icon when: not in collection OR (in collection AND submitting) */}
      <span x-show={isInCollection ? "isSubmitting" : "!isSubmitting"} x-cloak>
        {addToCollectionIcon}
      </span>
      {/* Show full icon when: in collection OR (NOT in collection AND submitting) */}
      <span x-show={isInCollection ? "!isSubmitting" : "isSubmitting"} x-cloak>
        {inCollectionIcon}
      </span>
    </>
  );

  const props = {
    id,
    xTarget: id,
    action: `/api/collection/${book.id}`,
    hiddenInput: { name: "isInCollection", value: isInCollection },
    buttonText: isCircleButton ? (
      buttonIcon
    ) : (
      <>
        <span x-show="!isSubmitting">
          {isInCollection ? "In My Collection" : "Add to Collection"}
        </span>
        <span x-show="isSubmitting" x-cloak>
          {isInCollection ? "Add to Collection" : "In My Collection"}
        </span>
        {buttonIcon}
      </>
    ),
  };

  if (isCircleButton) {
    return (
      <APIButtonCircle {...props} buttonType="circle" isDisabled={isDisabled}
      />
    );
  }

  return <APIButton {...props} isDisabled={isDisabled} />;
};

export default CollectionButton;

const addToCollectionIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);

const inCollectionIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6 fill-primary stroke-primary"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
    />
  </svg>
);
