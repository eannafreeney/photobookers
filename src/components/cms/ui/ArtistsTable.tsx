import { useUser } from "../../../contexts/UserContext";
import { Book, books, Creator } from "../../../db/schema";
import { getArtistsCreatedByUserId } from "../../../services/creators";

type ArtistsTableProps = {
  searchQuery?: string | null;
};

export const ArtistsTable = async ({ searchQuery }: ArtistsTableProps) => {
  const user = useUser();
  if (!user) {
    return <div>No user found</div>;
  }
  const artists = await getArtistsCreatedByUserId(
    user.creator?.id ?? "",
    searchQuery
  );
  if (!artists || artists.length === 0) {
    return (
      <div>
        No artists found. Use this area to manage artists that you created for
        your books.
      </div>
    );
  }

  return (
    <div class="flex flex-col gap-8">
      <SearchForm />
      <table id="books" class="table">
        <thead>
          <tr>
            <th>Cover</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {artists.map((artist) => (
            <ArtistTableRow artist={artist} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArtistsTable;

const SearchForm = () => {
  const xTargetAttrs = {
    "x-on:input.debounce": "$el.form.requestSubmit()",
    "x-on:search": "$el.form.requestSubmit()",
  };
  return (
    <form
      x-target="books"
      action="/dashboard/creators"
      role="search"
      aria-label="Artists"
      autocomplete="off"
      class="mt-8"
    >
      <label class="input">
        <svg
          class="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            stroke-linejoin="round"
            stroke-linecap="round"
            stroke-width="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          name="search"
          aria-label="Search Term"
          placeholder="Type to filter artists..."
          class="grow"
          {...xTargetAttrs}
        />
      </label>
    </form>
  );
};

const ArtistTableRow = ({ artist }: { artist: Creator }) => {
  if (!artist || !artist.id || !artist.slug || !artist.displayName) {
    return <></>;
  }

  return (
    <tr>
      <th>
        <img src={artist.coverUrl} alt={artist.displayName} class="w-12 h-12" />
      </th>
      <td>{artist.displayName}</td>
      <td>
        <a
          href={`/dashboard/creators/edit/${artist.id}`}
          class="btn btn-primary"
        >
          Edit
        </a>
      </td>
    </tr>
  );
};
