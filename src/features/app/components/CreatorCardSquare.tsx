import Card from "../../../components/app/Card";
import Link from "../../../components/app/Link";
import VerifiedCreator from "../../../components/app/VerifiedCreator";
import { CreatorCardResult } from "../../../constants/queries";

type CreatorCardSquareProps = {
  creator: CreatorCardResult;
};

const CreatorCardSquare = async ({ creator }: CreatorCardSquareProps) => {
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
        <div class="flex items-start gap-2">
          <Link href={`/creators/${creator.slug}`}>
            <Card.Title>{creator.displayName}</Card.Title>
          </Link>
          <VerifiedCreator creatorStatus={creator.status ?? "stub"} size="xs" />
        </div>
      </Card.Body>
    </Card>
  );
};

export default CreatorCardSquare;
