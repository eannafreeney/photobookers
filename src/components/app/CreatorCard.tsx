import { Creator } from "../../db/schema";
import Card from "./Card";
import ClaimCreatorBtn from "../claims/ClaimCreatorBtn";
import FollowButton from "../api/FollowButton";
import SectionTitle from "./SectionTitle";
import SocialLinks from "./SocialLinks";
import VerifiedCreator from "./VerifiedCreator";
import { AuthUser } from "../../../types";
import { findFollowersCount } from "../../db/queries";

type Props = {
  creator: Creator;
  currentPath: string;
  title?: string;
  orientation: "portrait" | "landscape";
  user: AuthUser | null;
};

const CreatorCard = async ({
  creator,
  currentPath,
  title = "About",
  orientation = "portrait",
  user,
}: Props) => {
  if (!creator) return <></>;

  const followerCount = await findFollowersCount(creator.id);

  if (orientation === "portrait")
    return (
      <CreatorCardPortrait
        creator={creator}
        currentPath={currentPath}
        title={title}
        user={user}
        followerCount={followerCount}
      />
    );

  return (
    <CreatorCardLandscape
      creator={creator}
      currentPath={currentPath}
      title={title}
      user={user}
      followerCount={followerCount}
    />
  );
};

export default CreatorCard;

type CreatorCardProps = {
  creator: Creator;
  currentPath: string;
  title?: string;
  user: AuthUser | null;
  followerCount: number;
};

const CreatorCardPortrait = ({
  creator,
  currentPath,
  title = "About",
  user,
  followerCount,
}: CreatorCardProps) => (
  <div class="flex flex-col gap-2">
    <SectionTitle>{title}</SectionTitle>
    <Card>
      <Card.Image
        src={creator.coverUrl ?? ""}
        alt={creator.displayName}
        href={`/creators/${creator.slug}`}
      />
      <Card.Body>
        <div>
          <Card.Title>
            <div class="flex items-center gap-2">
              {creator.displayName} {VerifiedCreator({ creator })}
            </div>
          </Card.Title>
          <Card.SubTitle>
            <div class="flex items-center gap-2">
              {creator.city ? `${creator.city}, ` : ""}
              {creator?.country ?? ""}
            </div>
          </Card.SubTitle>
        </div>
        <FollowersCount followerCount={followerCount} />
        {creator.tagline && <Card.Intro>{creator.tagline}</Card.Intro>}
        <FollowButton creator={creator} user={user} variant="desktop" />
        {user && creator.status === "stub" && (
          <ClaimCreatorBtn
            creator={creator}
            currentPath={currentPath}
            user={user}
          />
        )}
        <SocialLinks creator={creator} />
      </Card.Body>
    </Card>
  </div>
);

const CreatorCardLandscape = ({
  creator,
  currentPath,
  title = "About",
  user,
  followerCount,
}: CreatorCardProps) => {
  return (
    <div class="flex flex-col gap-2">
      <SectionTitle>{title}</SectionTitle>
      <Card>
        <div class="flex">
          <div class="shrink-0 w-2/6">
            <Card.Image
              src={creator.coverUrl ?? ""}
              alt={creator.displayName}
              href={`/creators/${creator.slug}`}
            />
          </div>
          <div class="w-3/6">
            <Card.Body>
              <div>
                <Card.Title>
                  <a
                    href={`/creators/${creator.slug}`}
                    class="flex items-center gap-2"
                  >
                    {creator.displayName} {VerifiedCreator({ creator })}
                  </a>
                </Card.Title>
                <Card.SubTitle>
                  <div class="flex items-center gap-2">
                    {creator.city ? `${creator.city}, ` : ""}
                    {creator?.country ?? ""}
                  </div>
                </Card.SubTitle>
              </div>
              <FollowersCount followerCount={followerCount} />
              {creator.tagline && <Card.Intro>{creator.tagline}</Card.Intro>}
              <SocialLinks creator={creator} />
            </Card.Body>
          </div>
          <div class="w-1/6">
            <Card.Body>
              <FollowButton creator={creator} user={user} isCircleButton />
              {creator.status === "stub" && (
                <ClaimCreatorBtn
                  creator={creator}
                  currentPath={currentPath}
                  user={user}
                  isCircleButton
                />
              )}
            </Card.Body>
          </div>
        </div>
      </Card>
    </div>
  );
};

const FollowersCount = ({ followerCount }: { followerCount: number }) => {
  if (followerCount === 0) return <></>;
  return <Card.Intro>{`${followerCount} following`}</Card.Intro>;
};

const followersIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke-width="1.5"
    stroke="currentColor"
    class="size-4"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
    />
  </svg>
);
