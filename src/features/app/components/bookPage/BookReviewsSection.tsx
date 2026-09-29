import Link from "@/components/app/Link";
import Button from "@/components/app/Button";
import type { AuthUser } from "../../../../../types";
import { isBookCreator } from "@/domain/reviews/policy";
import {
  getRequestForUserBook,
  getReviewerProfile,
  isAvailableForReview,
  listReviewsForBook,
} from "@/domain/reviews/services";
import ReviewCard from "../ReviewCard";

type Props = {
  bookId: string;
  bookSlug: string;
  artistOwnerUserId?: string | null;
  publisherOwnerUserId?: string | null;
  user: AuthUser | null;
};

const BookReviewsSection = async ({
  bookId,
  bookSlug,
  artistOwnerUserId,
  publisherOwnerUserId,
  user,
}: Props) => {
  const [err, reviews] = await listReviewsForBook(bookId);
  if (err) return <></>;

  const blocked =
    !!user &&
    isBookCreator(user.id, { artistOwnerUserId, publisherOwnerUserId });
  const mine = user ? reviews.some((review) => review.user.id === user.id) : false;
  const available = await isAvailableForReview(bookId).catch(() => false);
  const profile = user ? (await getReviewerProfile(user.id))[1] : null;
  const request =
    user && profile ? await getRequestForUserBook(user.id, bookId) : null;

  return (
    <section class="space-y-3" aria-labelledby="book-reviews-heading">
      <h2
        id="book-reviews-heading"
        class="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface/70"
      >
        Reviews
      </h2>
      {reviews.length === 0 ? (
        <p class="text-sm text-on-surface">No reviews yet.</p>
      ) : (
        <ul class="flex flex-col gap-4">
          {reviews.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} showBook={false} />
            </li>
          ))}
        </ul>
      )}
      <div class="flex flex-wrap gap-2">
        {user && !blocked && !mine ? (
          <a href={`/books/${bookSlug}/review`}>
            <Button variant="outline" color="primary" width="fit">
              Write a review
            </Button>
          </a>
        ) : null}
        {user && !blocked && mine ? (
          <a href={`/books/${bookSlug}/review`}>
            <Button variant="outline" color="primary" width="fit">
              Edit your review
            </Button>
          </a>
        ) : null}
        {user && profile && available && !request && !blocked ? (
          <Link href={`/books/${bookSlug}/review-request`} className="no-underline">
            <Button variant="outline" color="secondary" width="fit">
              Request a review copy
            </Button>
          </Link>
        ) : null}
        {!user ? (
          <a href={`/auth/login?redirectUrl=${encodeURIComponent(`/books/${bookSlug}/review`)}`}>
            <Button variant="outline" color="primary" width="fit">
              Write a review
            </Button>
          </a>
        ) : null}
      </div>
      <p>
        <a
          href="/reviews"
          class="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface/70 underline-offset-2 hover:text-on-surface-strong hover:underline"
        >
          All reviews
        </a>
      </p>
    </section>
  );
};

export default BookReviewsSection;
