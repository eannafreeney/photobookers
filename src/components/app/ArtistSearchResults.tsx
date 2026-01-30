import { Creator } from "../../db/schema";

type ArtistSearchResultsProps = {
  artists: Creator[];
};

const ArtistSearchResults = ({ artists }: ArtistSearchResultsProps) => {
  if (artists.length === 0) {
    return <div id="artist-search-results"></div>;
  }

  return (
    <div id="artist-search-results">
      <div class="mt-2">
        <p class="text-sm text-warning mb-2">Similar artists found:</p>
        <ul class="list-disc list-inside text-sm">
          {artists.map((artist) => (
            <li>
              <a href={`/creators/${artist.slug}`} target="_blank" class="link">
                {artist.displayName}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
export default ArtistSearchResults;
