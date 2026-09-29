import Card from "@/components/app/Card";
import Link from "@/components/app/Link";
import { reviewBylineHref } from "@/domain/reviews/policy";
import { reviewerDisplayName } from "@/domain/reviews/services";

type ReviewAuthor = {
  firstName: string | null;
  lastName: string | null;
  shelfSlug: string | null;
  shelfPublic: boolean;
  reviewerProfile?: { slug: string; displayName: string } | null;
};

type ReviewBook = {
  slug: string;
  title: string;
  coverUrl: string | null;
  artist?: { displayName: string } | null;
  publisher?: { displayName: string } | null;
};

export type ReviewCardData = {
  id: string;
  title: string;
  body: string;
  externalUrl: string | null;
  createdAt: Date | null;
  fromReviewCopy?: boolean;
  user: ReviewAuthor;
  book?: ReviewBook | null;
};

const excerpt = (body: string) => {
  const trimmed = body.trim();
  if (trimmed.length <= 320) return trimmed;
  return `${trimmed.slice(0, 320).trimEnd()}…`;
};

const ReviewByline = ({ user }: { user: ReviewAuthor }) => {
  const name = reviewerDisplayName(user);
  const href = reviewBylineHref({
    reviewerSlug: user.reviewerProfile?.slug,
    shelfSlug: user.shelfSlug,
    shelfPublic: user.shelfPublic,
  });
  if (!href) return <span>{name}</span>;
  return (
    <Link href={href} className="hover:text-accent no-underline">
      {name}
    </Link>
  );
};

const ReviewCard = ({
  review,
  showBook = true,
}: {
  review: ReviewCardData;
  showBook?: boolean;
}) => {
  const book = showBook ? review.book : null;
  return (
    <Card>
      {book?.coverUrl ? (
        <Link href={`/books/${book.slug}`} className="shrink-0 no-underline">
          <Card.Image
            src={book.coverUrl}
            alt={book.title}
            href={`/books/${book.slug}`}
          />
        </Link>
      ) : null}
      <Card.Body>
        {book ? (
          <h2 class="font-display text-2xl font-medium leading-tight text-on-surface-strong">
            <Link
              href={`/books/${book.slug}`}
              className="hover:text-accent no-underline"
            >
              {book.title}
            </Link>
          </h2>
        ) : (
          <h3 class="font-display text-xl font-medium text-on-surface-strong">
            {review.title}
          </h3>
        )}
        <p class="text-sm text-on-surface">
          <ReviewByline user={review.user} />
          {review.fromReviewCopy ? (
            <span class="text-xs uppercase tracking-[0.16em] text-accent">
              {" "}
              · Review copy
            </span>
          ) : null}
        </p>
        {book ? (
          <p class="font-medium text-on-surface-strong">{review.title}</p>
        ) : null}
        <p class="text-sm text-on-surface">{excerpt(review.body)}</p>
        {review.externalUrl ? (
          <a
            href={review.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            class="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface/70 underline-offset-2 hover:underline"
          >
            Also published elsewhere
          </a>
        ) : null}
      </Card.Body>
    </Card>
  );
};

export default ReviewCard;
