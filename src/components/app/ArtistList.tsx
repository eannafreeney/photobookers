import SectionTitle from "./SectionTitle";
import { Creator } from "../../db/schema";
import CreatorCard from "./CreatorCard";
import GridPanel from "./GridPanel";
import FollowButton from "./FollowButton";
import { useUser } from "../../contexts/UserContext";
import VerifiedCreator from "./VerifiedCreator";

type ArtistListProps = {
  artists: Creator[];
  creator: Creator;
};

const ArtistList = ({ artists, creator }: ArtistListProps) => {
  if (!artists || artists?.length === 0 || creator.type === "artist") {
    return <></>;
  }

  return (
    <div>
      <SectionTitle>Artists</SectionTitle>
      <GridPanel>
        <ul class="bg-surface rounded-radius shadow-md">
          {artists.map((artist) => (
            <ArtistCard artist={artist} />
          ))}
        </ul>
      </GridPanel>
    </div>
  );
};

export default ArtistList;

const ArtistCard = ({ artist }: { artist: Creator }) => {
  const user = useUser();
  return (
    <a href={`/creators/${artist.slug}`}>
      <li class="flex items-center gap-4 p-4">
        <div class="flex justify-between w-full">
          <div class="flex items-center gap-2">
            <img class="size-10 rounded-full" src={artist.coverUrl ?? ""} />

            <div class="flex items-center gap-2">
              {artist.displayName} {VerifiedCreator({ creator: artist })}
            </div>
            <div class="text-xs uppercase font-semibold opacity-60">
              {artist.city ? `${artist.city}, ` : ""}
              {artist.country}
            </div>
          </div>
          <FollowButton
            creator={artist}
            user={user ?? null}
            isCircleButton
          />
        </div>
      </li>
    </a>
  );
};
