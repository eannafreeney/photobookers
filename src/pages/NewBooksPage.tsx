import { AuthUser, Flash } from "../../types";
import WishlistButton from "../components/api/WishlistButton";
import BookCard from "../components/app/BookCard";
import Button from "../components/app/Button";
import Card from "../components/app/Card";
import CardCreatorCard from "../components/app/CardCreatorCard";
import CarouselMobile from "../components/app/CarouselMobile";
import GridPanel from "../components/app/GridPanel";
import Link from "../components/app/Link";
import { Pagination } from "../components/app/Pagination";
import SectionTitle from "../components/app/SectionTitle";
import ShareButton from "../components/app/ShareButton";
import AppLayout from "../components/layouts/AppLayout";
import FeatureGuard from "../components/layouts/FeatureGuard";
import NavTabs from "../components/layouts/NavTabs";
import Page from "../components/layouts/Page";
import { Book } from "../db/schema";
import { getNewBooks } from "../services/books";
import { formatDate } from "../utils";
import ErrorPage from "./error/errorPage";

type Props = {
  user: AuthUser | null;
  flash: Flash;
  currentPath: string;
  currentPage: number;
  isMobile: boolean;
};

const NewBooksPage = async ({
  user,
  flash,
  currentPath,
  currentPage,
  isMobile,
}: Props) => {
  const result = await getNewBooks(currentPage, 20);

  if (!result?.books) {
    return <ErrorPage errorMessage="No featured books found" />;
  }

  const { books } = result;

  return (
    <AppLayout title="Books" user={user} flash={flash}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <SectionTitle>{star} Book of the Day</SectionTitle>
        <div class="grid grid-cols-1 md:grid-cols-8 gap-4 items-end">
          <BookOfTheDayCard isMobile={isMobile} book={books[8]} user={user} />
          <MailingListSignup className="col-span-2" />
        </div>
        <FeatureGuard flagName="featured-books">
          {/* <SectionTitle>New & Notable</SectionTitle>
          <GridPanel isFullWidth>
            {books.map((book) => (
              <BookCard book={book} user={user} showHeader />
            ))}
          </GridPanel> */}
        </FeatureGuard>
        <NewBooksGrid
          user={user}
          currentPath={currentPath}
          currentPage={currentPage}
        />
      </Page>
    </AppLayout>
  );
};

export default NewBooksPage;

const NewBooksGrid = async ({
  user,
  currentPath,
  currentPage,
}: {
  user: AuthUser | null;
  currentPath: string;
  currentPage: number;
}) => {
  const targetId = "new-books-grid";

  const result = await getNewBooks(currentPage, 20);

  if (!result?.books) {
    return <div>No featured books found</div>;
  }

  const { books, totalPages, page } = result;

  return (
    <>
      <SectionTitle>Latest Releases</SectionTitle>
      <GridPanel isFullWidth id={targetId} xMerge="append">
        {books.map((book) => (
          <BookCard book={book} user={user} showHeader />
        ))}
      </GridPanel>
      <Pagination
        baseUrl={currentPath}
        page={page}
        totalPages={totalPages}
        targetId={targetId}
      />
    </>
  );
};

const BookOfTheDayCard = ({
  isMobile,
  book,
  user,
  currentCreatorId,
}: {
  isMobile: boolean;
  book: Book;
  user: AuthUser | null;
  currentCreatorId?: string | null;
}) => {
  if (isMobile) {
    return (
      <Card className="col-span-full">
        <CarouselMobile
          images={[
            book.coverUrl,
            ...(book?.images?.map((image) => image.imageUrl) ?? []),
          ]}
        />
        <Card.Body>
          <div class="flex items-start justify-between">
            <div>
              <Link href={`/books/${book.slug}`}>
                <Card.Title>{book.title}</Card.Title>
              </Link>
              <Card.Text>
                {book.releaseDate && formatDate(book.releaseDate)}
              </Card.Text>
            </div>
            <div class="flex items-center gap-2">
              <WishlistButton isCircleButton book={book} user={user} />
              <ShareButton isCircleButton />
            </div>
          </div>
          <div class="flex flex-col gap-2">
            {(!currentCreatorId || currentCreatorId !== book.artistId) && (
              <CardCreatorCard book={book} creatorType="artist" />
            )}
            {(!currentCreatorId || currentCreatorId !== book.publisherId) && (
              <CardCreatorCard book={book} creatorType="publisher" />
            )}
          </div>
          <Card.Intro>
            Reissued for the first time in pocket format, the the Atlas des
            Régions Naturelles Vol.3 as its name suggests, the second volume of
            a singular photographic adventure, as much for its size as for its
            duration.
          </Card.Intro>
          <Card.Tags tags={book.tags ?? []} />
          <Link href={`/books/${book.slug}`}>
            <span class="text-xs font-medium tracking-wide text-on-surface-weak italic hover:underline items-end">
              See More
            </span>
          </Link>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="col-span-6">
      <div class="flex items-end gap-2">
        <div class="w-xl shrink-0">
          <CarouselMobile
            images={[
              book.coverUrl,
              ...(book?.images?.map((image) => image.imageUrl) ?? []),
            ]}
          />
        </div>
        <div class="flex-1 min-w-0">
          <Card.Body gap="4">
            <div class="flex flex-col gap-2">
              <Card.Text>Jan 11, 2018</Card.Text>
              <Link href={`/books/${book.slug}`}>
                <h3 class="text-balance text-2xl font-bold text-on-surface-strong">
                  {book.title}
                </h3>
              </Link>
            </div>
            <div class="flex flex-col gap-2">
              {(!currentCreatorId || currentCreatorId !== book.artistId) && (
                <CardCreatorCard book={book} creatorType="artist" />
              )}
              {(!currentCreatorId || currentCreatorId !== book.publisherId) && (
                <CardCreatorCard book={book} creatorType="publisher" />
              )}
            </div>
            <Card.Intro>
              Reissued for the first time in pocket format, the the Atlas des
              Régions Naturelles Vol.3 as its name suggests, the second volume
              of a singular photographic adventure, as much for its size as for
              its duration. Launched six years ago, its objective is to
              document, in equal measure, the 450 natural regions or ‘lands’
              constituting the territory of France.
            </Card.Intro>
            <Card.Tags tags={book.tags ?? []} />
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <WishlistButton isCircleButton book={book} user={user} />
                <ShareButton isCircleButton />
              </div>
              <Link href={`/books/${book.slug}`}>
                <span class="text-xs font-medium tracking-wide text-on-surface-weak italic hover:underline items-end">
                  See More
                </span>
              </Link>
            </div>
          </Card.Body>
        </div>
      </div>
    </Card>
  );
};

const stars = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-9"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
    />
  </svg>
);

const star = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-5 text-yellow-500 fill-yellow-500"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
    />
  </svg>
);

type MailingListSignupProps = {
  className?: string;
  title?: string;
  description?: string;
};

const MailingListSignup = ({
  className = "",
  title = "Join the mailing list",
  description = "Get new book picks and updates in your inbox.",
}: MailingListSignupProps) => (
  <div
    class={`flex flex-col gap-3 rounded-radius border border-outline bg-surface p-4 ${className}`}
  >
    {stars}
    <p class="text-sm font-medium text-on-surface-strong">{title}</p>
    <p class="text-xs text-on-surface-weak">{description}</p>
    <form
      action="/api/newsletter"
      method="post"
      class="flex flex-col gap-2 w-full"
    >
      <input
        type="email"
        name="email"
        placeholder="you@example.com"
        required
        class="w-full md:w-auto min-w-0 flex-1 rounded-radius border border-outline bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-weak focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <Button variant="outline" color="inverse" width="full">
        Sign up
      </Button>
    </form>
  </div>
);
