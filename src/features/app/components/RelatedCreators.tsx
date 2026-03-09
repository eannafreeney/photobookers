import SectionTitle from "../../../components/app/SectionTitle";
import { CreatorCardResult } from "../../../constants/queries";
import Card from "../../../components/app/Card";
import Link from "../../../components/app/Link";

type Props = {
  creators: CreatorCardResult[];
  title?: string;
};

const CreatorsGrid = async ({ creators, title }: Props) => {
  if (creators.length === 0) return <></>;

  return (
    <section class="my-4">
      {title && <SectionTitle className="mb-2">{title}</SectionTitle>}
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {creators.map((creator) => (
          <RelatedCreatorCard creator={creator} />
        ))}
      </div>
    </section>
  );
};

export default CreatorsGrid;

type RelatedCreatorCardProps = {
  creator: CreatorCardResult;
};

const RelatedCreatorCard = async ({ creator }: RelatedCreatorCardProps) => {
  return (
    <Card className="shrink-0">
      <Link href={`/creators/${creator.slug}`}>
        <Card.Image
          src={creator.coverUrl ?? ""}
          alt={creator.displayName ?? ""}
          href={`/creators/${creator.slug}`}
          aspectSquare
          objectCover
        />
      </Link>
      <Card.Body>
        <Link href={`/creators/${creator.slug}`}>
          <Card.Title>{creator.displayName}</Card.Title>
        </Link>
      </Card.Body>
    </Card>
  );
};
