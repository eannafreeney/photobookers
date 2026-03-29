import Card from "../../../components/app/Card";
import Link from "../../../components/app/Link";
import VerifiedCreator from "../../../components/app/VerifiedCreator";
import { CreatorCardResult } from "../../../constants/queries";
import FollowButton from "../../api/components/FollowButton";
import { useUser } from "../../../contexts/UserContext";

type CreatorCardSquareProps = {
  creator: CreatorCardResult;
};

const CreatorCardSquare = async ({ creator }: CreatorCardSquareProps) => {
  const user = useUser();

  return (
    <Card className="shrink-0">
      <Card.Image
        src={creator.coverUrl ?? ""}
        alt={creator.displayName ?? ""}
        href={`/creators/${creator.slug}`}
        aspectSquare
        objectCover
      />
      <Card.Body>
        <div class="flex items-start justify-between gap-2">
          <div class="flex items-center gap-2">
            <Link href={`/creators/${creator.slug}`}>
              <Card.Title>{creator.displayName}</Card.Title>
            </Link>
            <VerifiedCreator
              creatorStatus={creator.status ?? "stub"}
              size="xs"
            />
          </div>
          <FollowButton creator={creator} user={user} isCircleButton />
        </div>
      </Card.Body>
    </Card>
  );
};

export default CreatorCardSquare;
