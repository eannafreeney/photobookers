import { Book, BookFair, Creator } from "../../db/schema";
import VerifiedCreator from "./VerifiedCreator";
import Avatar from "./Avatar";
import { formatDate } from "../../utils";
import { tagBooksUrl } from "../../lib/tags";

type CreatorSearchResult = Pick<
  Creator,
  "id" | "slug" | "displayName" | "coverUrl" | "status" | "type"
>;

type BookSearchResult = Pick<Book, "id" | "slug" | "coverUrl" | "title"> & {
  artist: Pick<Creator, "id" | "displayName"> | null;
  publisher: Pick<Creator, "id" | "displayName"> | null;
};

type FairSearchResult = Pick<
  BookFair,
  | "id"
  | "slug"
  | "name"
  | "coverUrl"
  | "startDate"
  | "endDate"
  | "city"
  | "country"
>;

type NavSearchResultsProps = {
  creators: CreatorSearchResult[];
  books: BookSearchResult[];
  fairs: FairSearchResult[];
  isMobile?: boolean;
  searchQuery?: string;
  variant?: "dropdown" | "page";
};

const NavSearchResults = ({
  creators,
  books,
  fairs,
  isMobile = false,
  searchQuery,
  variant = "dropdown",
}: NavSearchResultsProps) => {
  const hasResults =
    creators.length > 0 || books.length > 0 || fairs.length > 0;
  const fullResultsHref = searchQuery?.trim()
    ? `/search/results?search=${encodeURIComponent(searchQuery.trim())}`
    : null;
  const tagResultsHref = searchQuery?.trim()
    ? tagBooksUrl(searchQuery.trim())
    : null;
  const isPage = variant === "page";
  const containerId = isPage
    ? undefined
    : isMobile
      ? "search-results-mobile"
      : "search-results";
  const containerClass = isPage
    ? "rounded-radius border border-outline bg-surface-alt"
    : "fixed inset-0 z-50 h-screen w-screen md:absolute md:inset-auto top-18 md:top-11 md:h-auto md:w-fit md:min-w-64 lg:min-w-96 md:rounded-radius overflow-hidden rounded-radius border shadow-sm border-outline bg-surface-alt";

  return (
    <div
      id={containerId}
      class={containerClass}
      x-data={isPage ? undefined : "{ isOpen: true }"}
      x-show={isPage ? undefined : "isOpen"}
    >
      <div
        class={
          isPage ? "p-4 md:p-6" : "max-h-[calc(100vh-4rem)] overflow-y-auto p-4"
        }
      >
        {!hasResults && !isPage ? (
          <div class="p-8 text-center">
            <p class="text-sm text-on-surface">No results found</p>
          </div>
        ) : (
          <div
            class={
              isPage
                ? "grid grid-cols-1 gap-4 lg:h-[calc(100vh-18rem)] lg:grid-cols-3 lg:overflow-hidden"
                : "flex flex-col gap-4"
            }
          >
            {(isPage || creators.length > 0) && (
              <ResultsSection
                isPage={isPage}
                title="Creators"
                hasResults={creators.length > 0}
              >
                {creators.map((creator) => (
                  <CreatorResultItem key={creator.id} creator={creator} />
                ))}
              </ResultsSection>
            )}

            {(isPage || books.length > 0) && (
              <ResultsSection
                isPage={isPage}
                title="Books"
                hasResults={books.length > 0}
              >
                {books.map((book) => (
                  <BookResultItem key={book.id} book={book} />
                ))}
              </ResultsSection>
            )}

            {(isPage || fairs.length > 0) && (
              <ResultsSection
                isPage={isPage}
                title="Fairs"
                hasResults={fairs.length > 0}
              >
                {fairs.map((fair) => (
                  <FairResultItem key={fair.id} fair={fair} />
                ))}
              </ResultsSection>
            )}
          </div>
        )}
        {!isPage && (fullResultsHref || tagResultsHref) ? (
          <div class="mt-4 flex flex-col gap-2 border-t border-outline pt-4">
            {fullResultsHref ? (
              <CtaLinkButton href={fullResultsHref}>
                View all results for "{searchQuery?.trim()}"
              </CtaLinkButton>
            ) : null}
            {tagResultsHref ? (
              <CtaLinkButton href={tagResultsHref}>
                View all books tagged with "{searchQuery?.trim()}"
              </CtaLinkButton>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

const ResultsSection = ({
  title,
  isPage,
  hasResults,
  children,
}: {
  title: string;
  isPage: boolean;
  hasResults: boolean;
  children: any;
}) => {
  if (isPage) {
    return (
      <section class="flex flex-col rounded-radius border border-outline bg-surface p-4 lg:h-full lg:min-h-0 lg:overflow-hidden">
        <h2 class="pb-3 text-xs font-semibold uppercase text-on-surface">
          {title}
        </h2>
        {hasResults ? (
          <ul class="flex flex-1 flex-col gap-4 lg:min-h-0 lg:overflow-y-auto">
            {children}
          </ul>
        ) : (
          <p class="text-sm text-on-surface-muted">No results found</p>
        )}
      </section>
    );
  }

  return (
    <div class="flex flex-col gap-4">
      <div class="pt-2 pb-1 text-xs font-semibold uppercase text-on-surface">
        {title}
      </div>
      <ul class="flex flex-col gap-4">{children}</ul>
    </div>
  );
};

const CtaLinkButton = ({ href, children }: { href: string; children: any }) => (
  <a
    href={href}
    class="w-full rounded-radius px-5 py-2.5 text-center text-xs font-semibold uppercase tracking-[0.16em] transition hover:opacity-75 focus-visible:outline-2 focus-visible:outline-offset-2 active:opacity-100 active:outline-offset-0 cursor-pointer bg-primary text-on-primary"
  >
    {children}
  </a>
);

type CreatorResultItemProps = {
  creator: CreatorSearchResult;
};

const CreatorResultItem = ({ creator }: CreatorResultItemProps) => {
  return (
    <li>
      <a
        href={`/creators/${creator.slug}`}
        class="flex items-center gap-3 rounded-radius transition-colors"
      >
        <div class="relative">
          <Avatar
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            size="md"
          />
          <div class="absolute -top-1 -right-1">
            <VerifiedCreator
              creatorStatus={creator.status ?? "stub"}
              size="xs"
            />
          </div>
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-on-surface truncate">
            {creator.displayName}
          </div>
          <div class="text-xs uppercase font-semibold text-on-surface">
            {creator.type}
          </div>
        </div>
      </a>
    </li>
  );
};

type BookResultItemProps = {
  book: BookSearchResult;
};

const BookResultItem = ({ book }: BookResultItemProps) => {
  return (
    <li>
      <a
        href={`/books/${book.slug}`}
        class="flex items-center gap-3 rounded-radius transition-colors"
        aria-label={`View ${book.title} by ${book.artist?.displayName ?? "Unknown artist"}`}
      >
        <div class="shrink-0">
          <img
            src={book.coverUrl ?? ""}
            alt={`${book.title} cover`}
            class="w-12 h-12 object-cover rounded-sm"
            loading="lazy"
          />
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-on-surface truncate">{book.title}</div>
          {book.artist && (
            <div class="text-xs text-on-surface truncate">
              {book.artist.displayName}{" "}
              {book.publisher?.displayName &&
                `- ${book.publisher?.displayName}`}
            </div>
          )}
        </div>
      </a>
    </li>
  );
};

type FairResultItemProps = {
  fair: FairSearchResult;
};

const FairResultItem = ({ fair }: FairResultItemProps) => {
  return (
    <li>
      <a
        href={`/fairs/${fair.slug}`}
        class="flex items-center gap-3 rounded-radius transition-colors"
        aria-label={`View ${fair.name}`}
      >
        <div class="shrink-0">
          {fair.coverUrl ? (
            <img
              src={fair.coverUrl}
              alt={`${fair.name} cover`}
              class="w-12 h-12 object-cover rounded-sm"
              loading="lazy"
            />
          ) : (
            <div class="w-12 h-12 bg-surface-alt rounded-sm flex items-center justify-center">
              <span class="text-xs text-on-surface-weak">Fair</span>
            </div>
          )}
        </div>
        <div class="flex-1 min-w-0">
          <div class="font-semibold text-on-surface truncate">{fair.name}</div>
          <div class="text-xs text-on-surface truncate">
            {formatDate(fair.startDate)} - {formatDate(fair.endDate)}
          </div>
          {(fair.city || fair.country) && (
            <div class="text-xs text-on-surface-weak truncate">
              {fair.city && fair.country
                ? `${fair.city}, ${fair.country}`
                : fair.city || fair.country}
            </div>
          )}
        </div>
      </a>
    </li>
  );
};

export default NavSearchResults;

const closeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    class="size-6"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);
