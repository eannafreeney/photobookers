import Button from "@/components/app/Button";
import AiActionForm from "./AiActionForm";
import ArtistAnswerForm from "./ArtistAnswerForm";
import ArtistEmailAction from "./ArtistEmailAction";
import DeleteBookForm from "./DeleteBookForm";
import DescriptionForm from "./DescriptionForm";
import ReorderControls from "./ReorderControls";
import { BookCardResult } from "@/constants/queries";

type IssueBookCardProps = {
  number: number;
  /** Total books in the issue, so the card knows if it's at an edge. */
  count?: number;
  bookId: string;
  book: BookCardResult | null;
  blurb: string | null;
  action: string;
  /** Admin-chosen featured image, or null to show the book's cover. */
  selectedImageUrl?: string | null;
  artistPrompt?: string | null;
  artistQuote?: string | null;
  artistEmailSentAt?: Date | string | null;
};

const IssueBookCard = ({
  number,
  count = number,
  bookId,
  book,
  blurb,
  action,
  selectedImageUrl = null,
  artistPrompt = null,
  artistQuote = null,
  artistEmailSentAt = null,
}: IssueBookCardProps) => {
  const targetId = `magazine-book-${number}`;
  const thumbnailUrl = selectedImageUrl ?? book?.coverUrl ?? null;
  return (
    <li
      id={targetId}
      class="flex flex-col md:flex-row items-start gap-3 border border-outline bg-surface-alt/40 p-3"
    >
      {/* Image column: 30% of the card */}
      <div class="w-full md:w-[30%] shrink-0">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            loading="lazy"
            class="w-full border border-outline object-cover"
          />
        ) : (
          <div class="flex aspect-3/4 w-full items-center justify-center border border-outline text-[0.6rem] text-on-surface-weak">
            no image
          </div>
        )}
        <div class="mt-2 flex flex-col gap-2">
          <a
            href={`${action}/image?bookId=${bookId}`}
            x-target="modal-root"
            class="inline-flex w-full items-center justify-center gap-1 border border-outline bg-surface-alt px-2 py-1.5 text-xs font-medium text-on-surface transition-colors hover:border-accent hover:text-accent"
          >
            <Button variant="outline" color="primary" width="full">
              {selectedImageUrl ? "Change image" : "Choose image"}
            </Button>
          </a>
          <AiActionForm
            action={`${action}/regenerate-blurb`}
            bookId={bookId}
            targetId={targetId}
            label="Regenerate blurb (AI)"
            busyLabel="Writing…"
          />
          <AiActionForm
            action={`${action}/swap-book`}
            bookId={bookId}
            targetId={targetId}
            label="Swap book (AI)"
            busyLabel="Swapping…"
          />
        </div>
      </div>

      {/* Content column: the remaining 70% */}
      <div class="flex min-w-0 w-full md:w-auto flex-1 flex-col gap-2">
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="font-display text-2xl font-medium text-on-surface-strong">
              <a href={`/books/${book?.slug}`} target="_blank">
                {book?.title ?? "Untitled"}
              </a>
            </span>
          </div>
          <div class="flex shrink-0 items-center gap-4">
            <ReorderControls
              bookId={bookId}
              action={action}
              isFirst={number <= 1}
              isLast={number >= count}
            />
            <DeleteBookForm bookId={bookId} action={action} />
          </div>
        </div>
        <span class="text-sm text-on-surface-weak">
          <a href={`/creators/${book?.artist?.slug}`} target="_blank">
            {book?.artist?.displayName ?? "Unknown artist"}
          </a>
        </span>
        <span class="text-sm text-on-surface-weak">
          <a href={`/creators/${book?.publisher?.slug}`} target="_blank">
            {book?.publisher?.displayName ?? "Unknown publisher"}
          </a>
        </span>
        <DescriptionForm bookId={bookId} blurb={blurb} action={action} />
        <p class="text-sm text-on-surface-strong">{`Question: ${artistPrompt}`}</p>
        <ArtistEmailAction
          action={action}
          bookId={bookId}
          artistPrompt={artistPrompt}
          artistEmailSentAt={artistEmailSentAt}
        />
        {/* The answer field only makes sense once the question has been sent. */}
        {artistEmailSentAt ? (
          <ArtistAnswerForm
            bookId={bookId}
            artistQuote={artistQuote}
            action={action}
          />
        ) : null}
      </div>
    </li>
  );
};

export default IssueBookCard;
