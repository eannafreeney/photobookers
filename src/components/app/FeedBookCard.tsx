import clsx from "clsx";
import Card from "./Card";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import Link from "./Link";
import { AuthUser } from "../../../types";
import { BookCardResult } from "../../constants/queries";
import Show from "./Show";
import FavouriteButton from "../../features/api/components/FavouriteButton";
import BookCard from "./BookCard";

type BookCardProps = {
  book: BookCardResult;
  user: AuthUser | null;
  currentCreatorId?: string | null;
  maxDisplayNameLength?: number;
  className?: string;
  featureDate?: Date;
};

const FeedBookCard = ({
  book,
  user,
  currentCreatorId,
  maxDisplayNameLength = 16,
  className,
  featureDate,
}: BookCardProps) => {
  const banner = `${book.artist?.displayName} has published a new book`;
  return (
    <BookCard
      banner={banner}
      book={book}
      user={user}
      currentCreatorId={currentCreatorId}
      maxDisplayNameLength={maxDisplayNameLength}
      className={className}
      featureDate={featureDate}
    />
  );
};

export default FeedBookCard;
