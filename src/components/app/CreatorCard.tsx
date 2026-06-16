import { CreatorCardResult } from "../../constants/queries";
import { Creator } from "../../db/schema";
import Card from "./Card";
import ClaimCreatorBtn from "../../features/claims/components/ClaimCreatorBtn";
import FollowButton from "../../features/api/components/FollowButton";
import SocialLinks from "./SocialLinks";
import VerifiedCreator from "./VerifiedCreator";
import { AuthUser } from "../../../types";
import { findFollowersCount } from "../../db/queries";
import Show from "./Show";
import { formatCountry } from "../../lib/utils";
import { formatDate } from "../../utils";
import CardCreatorCard from "./CardCreatorCard";
import FollowersCount from "./FollowersCount";

type Props = {
  creator: CreatorCardResult | null;
  currentPath: string;
  title?: string;
  user: AuthUser | null;
  featureDate?: Date;
  showFollowAndClaimButtons?: boolean;
  shouldRefreshCreatorMessages?: boolean;
  showHeader?: boolean;
};

const CreatorCard = async ({
  creator,
  currentPath,
  title,
  user,
  featureDate,
  showFollowAndClaimButtons = true,
  shouldRefreshCreatorMessages = false,
  showHeader = true,
}: Props) => {
  if (!creator) return <></>;

  const followerCount = await findFollowersCount(creator.id);

  return (
    <div className="flex flex-col gap-4">
      {title && (
        <div class="text-sm py-0 text-on-surface font-bold mb-0">{title}</div>
      )}
      <Card>
        {showHeader && (
          <div class="px-3 py-2 flex items-center justify-between h-10">
            <CardCreatorCard
              creator={creator ?? null}
              maxDisplayNameLength={30}
            />
            {featureDate && <Card.Text>{formatDate(featureDate)}</Card.Text>}
          </div>
        )}
        <Card.Image
          src={creator.coverUrl ?? ""}
          alt={creator.displayName}
          href={`/creators/${creator.slug}`}
          aspectSquare
          objectCover
        />
        <Card.Body>
          <div>
            <Card.Title>
              <a
                href={`/creators/${creator.slug}`}
                class="flex items-center gap-1"
              >
                {creator.displayName}{" "}
                <VerifiedCreator
                  creatorStatus={creator.status ?? "stub"}
                  size="xs"
                />
              </a>
            </Card.Title>
            <Card.SubTitle>
              <div class="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                {(creator.city || creator.country) && (
                  <span>
                    {creator.city ? `${creator.city}, ` : ""}
                    {formatCountry(creator?.country ?? "")}
                  </span>
                )}
              </div>
            </Card.SubTitle>
            <FollowersCount count={followerCount} />
          </div>
          {creator.tagline && (
            <Card.Description>{creator.tagline}</Card.Description>
          )}
          <Show when={showFollowAndClaimButtons}>
            <FollowButton
              creator={creator}
              user={user}
              shouldRefreshCreatorMessages={shouldRefreshCreatorMessages}
            />
            {creator.status === "stub" && (
              <ClaimCreatorBtn
                creator={creator as Creator}
                user={user}
                currentPath={currentPath}
              />
            )}
            <SocialLinks creator={creator as Creator} />
          </Show>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CreatorCard;
