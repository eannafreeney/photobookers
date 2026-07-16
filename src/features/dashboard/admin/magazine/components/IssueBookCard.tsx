import AiActionForm from "./AiActionForm";
import ArtistAnswerForm from "./ArtistAnswerForm";
import ArtistEmailAction from "./ArtistEmailAction";
import DeleteBookForm from "./DeleteBookForm";
import DescriptionForm from "./DescriptionForm";
import { BookCardResult } from "@/constants/queries";

type IssueBookCardProps = {
  number: number;
  bookId: string;
  book: BookCardResult | null;
  blurb: string | null;
  action: string;
  artistPrompt?: string | null;
  artistQuote?: string | null;
  artistEmailSentAt?: Date | string | null;
};

const IssueBookCard = ({
  number,
  bookId,
  book,
  blurb,
  action,
  artistPrompt = null,
  artistQuote = null,
  artistEmailSentAt = null,
}: IssueBookCardProps) => {
  const targetId = `magazine-book-${number}`;
  return (
    <li
      id={targetId}
      class="flex flex-col md:flex-row items-start gap-3 border border-outline bg-surface-alt/40 p-3"
    >
      {/* Image column: 30% of the card */}
      <div class="w-full md:w-[30%] shrink-0">
        {book?.coverUrl ? (
          <img
            src={book.coverUrl}
            alt=""
            loading="lazy"
            class="w-full border border-outline object-cover"
          />
        ) : (
          <div class="flex aspect-3/4 w-full items-center justify-center border border-outline text-[0.6rem] text-on-surface-weak">
            no cover
          </div>
        )}
        <div class="mt-2 flex flex-col gap-2">
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
            <span class="font-display text-base font-medium text-on-surface-strong">
              <a href={`/books/${bookId}`} target="_blank">
                {book?.title ?? "Untitled"}
              </a>
            </span>
            {book?.artist?.status === "verified" ? (
              <span class="text-[0.6rem] font-semibold uppercase tracking-wider text-[#4f7a4a]">
                ✦ Verified
              </span>
            ) : null}
          </div>
          <DeleteBookForm bookId={bookId} action={action} />
        </div>
        <span class="text-xs text-on-surface-weak">
          <a href={`/creators/${book?.artist?.slug}`} target="_blank">
            {book?.artist?.displayName ?? "Unknown artist"}
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
