import { AuthUser } from "../../../types";
import { Book, Creator } from "../../db/schema";
import FollowButton from "./FollowButton";

type NavSearchResultsProps = {
  creators: Creator[];
  books: (Book & { artist: Creator })[];
  user: AuthUser | null;
};

const NavSearchResults = ({ creators, books, user }: NavSearchResultsProps) => {
  return (
    <ul
      id="search-results"
      class="list flex flex-col overflow-hidden rounded-radius border border-outline bg-surface-alt p-2 shadow-sm
              fixed inset-0 z-50 h-screen w-screen md:absolute md:inset-auto top-18 md:top-11 md:-left-24 md:right-0 md:h-auto md:w-fit md:min-w-64 md:rounded-radius"
    >
      <button class="md:hidden self-end p-2" x-on:click="hasResults = false">
        {closeIcon}
      </button>
      {creators.length > 0 && (
        <>
          <li class="text-xs uppercase font-semibold opacity-60 px-2 pt-2">
            Creators
          </li>
          {creators.map((creator) => (
            <a href={`/creators/${creator.slug}`}>
              <li class="list-row items-center gap-4 rounded-radius hover:bg-surface">
                <div>
                  <img
                    src={creator.coverUrl ?? ""}
                    alt={creator.displayName}
                    class="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div>
                  <div>{creator.displayName}</div>
                  <div class="text-xs uppercase font-semibold opacity-60">
                    {creator.type}
                  </div>
                </div>
                {user && (
                  <FollowButton
                    isCircleButton
                    creatorId={creator.id}
                    user={user}
                  />
                )}
              </li>
            </a>
          ))}
        </>
      )}

      {books.length > 0 && (
        <>
          <li class="text-xs uppercase font-semibold opacity-60 px-2 pt-2">
            Books
          </li>
          {books.map((book) => (
            <a href={`/books/${book.slug}`}>
              <li class="list-row items-center gap-4 rounded-radius hover:bg-surface">
                <div>
                  <img
                    src={book.coverUrl ?? ""}
                    alt={book.title}
                    class="w-auto h-12 object-cover"
                  />
                </div>
                <div>
                  <div>{book.title}</div>
                  <div class="text-xs uppercase font-semibold opacity-60">
                    {book.artist?.displayName ?? ""}
                  </div>
                </div>
              </li>
            </a>
          ))}
        </>
      )}

      {books.length === 0 && creators.length === 0 && (
        <li class="p-4 text-center opacity-60">No results found</li>
      )}
    </ul>
  );
};

export default NavSearchResults;

const closeIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-6 cursor-pointer"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M6 18 18 6M6 6l12 12"
    />
  </svg>
);
