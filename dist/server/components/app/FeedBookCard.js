import { jsx } from "hono/jsx/jsx-runtime";
import BookCard from "./BookCard.js";
const FeedBookCard = ({
  book,
  user,
  currentCreatorId,
  maxDisplayNameLength = 16,
  className,
  featureDate
}) => {
  const banner = `${book.artist?.displayName} has published a new book`;
  return /* @__PURE__ */ jsx(
    BookCard,
    {
      banner,
      book,
      user,
      currentCreatorId,
      maxDisplayNameLength,
      className,
      featureDate
    }
  );
};
var FeedBookCard_default = FeedBookCard;
export {
  FeedBookCard_default as default
};
