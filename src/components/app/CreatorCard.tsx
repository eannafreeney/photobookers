import { useUser } from "../../contexts/UserContext";
import { Creator } from "../../db/schema";
import { canFollowCreator } from "../../lib/permissions";
import Card from "./Card";
import ClaimCreatorBtn from "./ClaimCreatorBtn";
import FollowButton from "./FollowButton";
import Link from "./Link";
import SectionTitle from "./SectionTitle";
import SocialLinks from "./SocialLinks";
import VerifiedCreator from "./VerifiedCreator";

type CreatorCardProps = {
  creator: Creator | null;
  currentPath: string;
};

const CreatorCard = ({ creator, currentPath }: CreatorCardProps) => {
  if (!creator) return <></>;
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
                {creator.displayName} 
              </div>
            </Card.Title>
            <Card.SubTitle>
              <div class="flex items-center gap-2">
                {creator.city ? `${creator.city}, ` : ""}
                {creator?.country ?? ""}
                {VerifiedCreator({ creator })}
              </div>
            </Card.SubTitle>
          </div>
          {creator.bio && <Card.Intro>{creator.bio ?? ""}</Card.Intro>}
          <FollowButton
            creator={creator}
            user={user}
            variant="desktop"
          />
          {creator.status === "stub" ? (
            <ClaimCreatorBtn
              creator={creator}
              currentPath={currentPath}
              user={user ?? undefined}
            />
          ) : (
            <></>
          )}
          <SocialLinks creator={creator} />
        </Card.Body>
      </Card>
    </>
  );
};

export default CreatorCard;
