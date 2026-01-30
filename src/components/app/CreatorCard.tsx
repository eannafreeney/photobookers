import { useUser } from "../../contexts/UserContext";
import { Creator } from "../../db/schema";
import Card from "./Card";
import ClaimCreatorBtn from "./ClaimCreatorBtn";
import FollowButton from "./FollowButton";
import Link from "./Link";
import SectionTitle from "./SectionTitle";
import VerifiedCreator from "./VerifiedCreator";

type CreatorCardProps = {
  creator: Creator;
  currentPath: string;
};

const CreatorCard = ({ creator, currentPath }: CreatorCardProps) => {
  const user = useUser();

  return (
    <>
      <SectionTitle>About</SectionTitle>
      <Card>
        <Card.Image src={creator.coverUrl ?? ""} alt={creator.displayName} />
        <Card.Body>
          <div>
            <Card.Title>
              <div class="flex items-center gap-2">
                {creator.displayName} {VerifiedCreator({ creator })}
              </div>
            </Card.Title>
            <Card.SubTitle>
              <div>
                {creator.city ? `${creator.city}, ` : ""}
                {creator?.country ?? ""}
              </div>
            </Card.SubTitle>
          </div>
          <Card.Description>{creator.bio ?? ""}</Card.Description>
          <FollowButton creatorId={creator.id} user={user ?? null} />
          <ClaimCreatorBtn
            creator={creator}
            currentPath={currentPath}
            user={user ?? undefined}
          />
          <SocialLinks creator={creator} />
        </Card.Body>
      </Card>
    </>
  );
};

export default CreatorCard;

const SocialLinks = ({ creator }: { creator: Creator }): JSX.Element => {
  if (creator.status === "stub") return <></>;

  return (
    <div class="flex md:flex-col flex-row gap-2 color-green-500">
      {creator.facebook && <Link href={creator.facebook}>Facebook</Link>}
      {creator.twitter && <Link href={creator.twitter}>Twitter</Link>}
      {creator.instagram && <Link href={creator.instagram}>Instagram</Link>}
      {creator.website && <Link href={creator.website}>Website</Link>}
    </div>
  );
};
