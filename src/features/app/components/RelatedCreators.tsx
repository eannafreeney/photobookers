import SectionTitle from "../../../components/app/SectionTitle";
import { getRelatedCreators } from "../services";
import { CreatorCardResult } from "../../../constants/queries";
import Card from "../../../components/app/Card";
import Link from "../../../components/app/Link";

type Props = {
  creatorType: "artist" | "publisher";
  creatorId: string;
};

const RelatedCreators = async ({ creatorType, creatorId }: Props) => {
  const relatedCreators = await getRelatedCreators(creatorId, creatorType);
  if (relatedCreators.length === 0) return <></>;

  const title = creatorType === "publisher" ? "Artists" : "Publishers";

  return (
    <section class="flex flex-col gap-2">
      <SectionTitle>{title}</SectionTitle>
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {relatedCreators.map((creator) => (
          <RelatedCreatorCard creator={creator} />
        ))}
      </div>
    </section>
  );
};

export default RelatedCreators;

type RelatedCreatorCardProps = {
  creator: CreatorCardResult;
};

const RelatedCreatorCard = async ({ creator }: RelatedCreatorCardProps) => {
  return (
    <Card>
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
