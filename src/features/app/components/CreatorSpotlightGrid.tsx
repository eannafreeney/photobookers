import Button from "../../../components/app/Button";
import Card from "../../../components/app/Card";
import Link from "../../../components/app/Link";
import SectionTitle from "../../../components/app/SectionTitle";
import type {
  ArtistOfTheWeekWithCreator,
  PublisherOfTheWeekWithCreator,
} from "../../dashboard/admin/planner/services";

type CreatorSpotlightsGridProps = {
  artistOfTheWeek: ArtistOfTheWeekWithCreator | null;
  publisherOfTheWeek: PublisherOfTheWeekWithCreator | null;
};

const CreatorSpotlightsGrid = ({
  artistOfTheWeek,
  publisherOfTheWeek,
}: CreatorSpotlightsGridProps) => {
  const artist = artistOfTheWeek?.creator ?? null;
  const publisher = publisherOfTheWeek?.creator ?? null;

  return (
    <div class="grid md:grid-cols-2 gap-4 w-full">
      {artist && (
        <div>
          <SectionTitle className="mb-2">Artist of the Week</SectionTitle>
          <CreatorSpotlight
            creator={artist}
            text={artistOfTheWeek?.text ?? null}
            href={`/creators/${artist.slug}`}
          />
        </div>
      )}
      {publisher && (
        <div>
          <SectionTitle className="mb-2">Publisher of the Week</SectionTitle>
          <CreatorSpotlight
            creator={publisher}
            text={publisherOfTheWeek?.text ?? null}
            href={`/creators/${publisher.slug}`}
          />
        </div>
      )}
    </div>
  );
};

export default CreatorSpotlightsGrid;

type CreatorSpotlightProps = {
  creator: {
    id: string;
    displayName: string;
    slug: string;
    coverUrl: string | null;
    bio?: string | null;
  };
  text?: string | null;
  href: string;
};

const CreatorSpotlight = ({ creator, text, href }: CreatorSpotlightProps) => (
  <Card className="flex-col md:flex-row">
    <div className="w-full md:w-1/2 shrink-0">
      <Card.Image
        src={creator.coverUrl ?? ""}
        alt={creator.displayName}
        href={href}
        aspectSquare
        objectCover
      />
    </div>
    <div class="flex flex-col justify-end gap-2 w-full md:w-1/2 min-w-0">
      <Card.Body>
        <Card.Title>{creator.displayName}</Card.Title>
        {text && <Card.Description>{text}</Card.Description>}
        <Link href={href}>
          <Button variant="solid" color="primary" width="full">
            View Catalogue
          </Button>
        </Link>
      </Card.Body>
    </div>
  </Card>
);
