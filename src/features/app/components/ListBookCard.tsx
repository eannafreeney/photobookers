import Button from "../../../components/app/Button";
import Link from "../../../components/app/Link";
import { BookCardResult } from "../../../constants/queries";
import { bookShareText, bookShareTitle } from "../../../lib/share";
import { AuthUser } from "../../../../types";
import SaveToListButton from "../../api/components/SaveToListButton";
import ShareButton from "../../api/components/ShareButton";
import SpotlightCreator from "./SpotlightCreator";
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
      <ImageCarousel images={images} alt={book.title} />

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

const ImageCarousel = ({ images, alt }: { images: string[]; alt: string }) => {
  if (images.length === 0) {
    return (
      <div class="flex aspect-[4/5] w-full items-center justify-center border border-outline bg-surface text-xs text-on-surface-weak">
        No images
      </div>
    );
  }

  const multiple = images.length > 1;

  return (
    <div
      x-data={`carouselForm(${JSON.stringify(images)})`}
      class="group relative w-full overflow-hidden border border-outline bg-surface-alt"
    >
      <div
        class="relative w-full"
        x-on:touchstart="handleTouchStart($event)"
        x-on:touchmove="handleTouchMove($event)"
        x-on:touchend="handleTouchEnd()"
      >
        <div
          class="flex items-center h-full transition-transform duration-300 ease-out"
          x-bind:style="`transform: translateX(-${(currentSlideIndex - 1) * 100}%)`"
        >
          <template x-for="slide in slides">
            <div class="h-full w-full shrink-0">
              <img
                class="h-full w-full object-contain"
                x-bind:src="slide.imgSrc"
                alt={alt}
                loading="lazy"
              />
            </div>
          </template>
        </div>

        {multiple ? (
          <>
            <button
              type="button"
              aria-label="Previous image"
              x-on:click="previous()"
              class="absolute left-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100 cursor-pointer"
            >
              {arrowLeftIcon}
            </button>
            <button
              type="button"
              aria-label="Next image"
              x-on:click="next()"
              class="absolute right-2 top-1/2 z-10 flex size-8 -translate-y-1/2 items-center justify-center border border-outline bg-surface/80 text-on-surface-strong opacity-0 backdrop-blur-sm transition-opacity hover:border-accent hover:text-accent group-hover:opacity-100 cursor-pointer"
            >
              {arrowRightIcon}
            </button>
            <div class="absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1.5">
              <template x-for="(slide, index) in slides">
                <button
                  type="button"
                  class="size-1.5 rounded-full transition"
                  x-on:click="currentSlideIndex = index + 1"
                  x-bind:class="currentSlideIndex === index + 1 ? 'bg-on-surface-strong w-4' : 'bg-on-surface/50'"
                  x-bind:aria-label="'Image ' + (index + 1)"
                ></button>
              </template>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

const arrowLeftIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2.5"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const arrowRightIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    stroke="currentColor"
    fill="none"
    stroke-width="2.5"
    class="size-4"
    aria-hidden="true"
  >
    <path d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

export default ListBookCard;
