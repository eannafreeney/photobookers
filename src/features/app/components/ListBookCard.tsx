import Button from "../../../components/app/Button";
import Link from "../../../components/app/Link";
import { BookCardResult } from "../../../constants/queries";
import { bookShareText, bookShareTitle } from "../../../lib/share";
import { AuthUser } from "../../../../types";
import SaveToListButton from "../../api/components/SaveToListButton";
import ShareButton from "../../api/components/ShareButton";
import SpotlightCreator from "./SpotlightCreator";
import BookImageCarousel from "./BookImageCarousel";
import { bookUrl } from "../spotlightUrls";

export type ListBookCardBook = BookCardResult & {
  note?: string | null;
  images?: { imageUrl: string }[];
};

type Props = {
  book: ListBookCardBook;
  user: AuthUser | null;
};

const galleryUrls = (book: ListBookCardBook): string[] => {
  const raw = [
    book.coverUrl,
    ...(book.images?.map((image) => image.imageUrl) ?? []),
  ].filter(Boolean) as string[];
  return Array.from(new Set(raw));
};

const ListBookCard = ({ book, user }: Props) => {
  const images = galleryUrls(book);
  const artist = book.artist;
  const publisher = book.publisher;
  const note = book.note?.trim();
  const hasArtist = !!artist;
  const hasPublisher = !!publisher;
  const href = `/books/${book.slug}`;

  return (
    <article class="flex w-full flex-col gap-5">
      <BookImageCarousel images={images} alt={book.title} />

      <div class="flex flex-col items-center gap-4">
        <h2 class="text-center font-display text-2xl font-medium text-on-surface-strong text-balance">
          <Link href={href} className="hover:text-accent no-underline">
            {book.title}
          </Link>
        </h2>

        {(hasArtist || hasPublisher) && (
          <div
            class={`flex w-full flex-col items-center gap-4 ${
              hasArtist && hasPublisher ? "sm:grid sm:grid-cols-2" : ""
            }`}
          >
            {hasArtist ? (
              <a href={`/creators/${artist.slug}`}>
                <SpotlightCreator
                  creator={artist}
                  role="Artist"
                  truncateName={false}
                  isVerified={artist.status === "verified"}
                />
              </a>
            ) : null}
            {hasPublisher ? (
              <a href={`/creators/${publisher.slug}`}>
                <SpotlightCreator
                  creator={publisher}
                  role="Publisher"
                  truncateName={false}
                  isVerified={publisher.status === "verified"}
                />
              </a>
            ) : null}
          </div>
        )}

        <div class="grid w-full grid-cols-2 gap-4">
          <SaveToListButton book={book} user={user} variant="button" />
          <ShareButton
            title={bookShareTitle(book)}
            text={bookShareText(book)}
            url={bookUrl(book.slug)}
          />
        </div>

        {note ? (
          <p class="max-w-prose whitespace-pre-wrap text-center text-base leading-relaxed text-on-surface text-pretty">
            {note}
          </p>
        ) : null}

        <a href={href} class="w-full">
          <Button type="button" variant="outline" color="primary" width="full">
            View book →
          </Button>
        </a>
      </div>
    </article>
  );
};

export default ListBookCard;
