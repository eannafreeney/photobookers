import FollowersCount from "@/components/app/FollowersCount";
import SocialLinks from "@/components/app/SocialLinks";
import { Creator } from "@/db/schema";
import { findFollowersCount } from "@/db/queries";
import { formatCountry } from "@/lib/utils";

type CreatorBioMetaProps = {
  creator: Creator;
  variant?: "inline" | "stacked";
  align?: "left" | "right";
  followerCount?: number;
};

const CreatorBioMeta = async ({
  creator,
  variant = "inline",
  align = "left",
  followerCount: followerCountProp,
}: CreatorBioMetaProps) => {
  const followerCount =
    followerCountProp ?? (await findFollowersCount(creator.id));
  const hasLocation = !!(creator.city || creator.country);
  const hasFollowers = followerCount > 10;
  const hasSocials = !!(
    creator.website ||
    creator.facebook ||
    creator.instagram ||
    creator.twitter
  );

  if (!hasLocation && !hasFollowers && !hasSocials) return <></>;

  if (variant === "stacked") {
    return (
      <div
        class={`flex flex-col gap-2 text-sm text-on-surface ${align === "right" ? "items-end text-right" : ""}`}
      >
        {hasLocation && (
          <span>
            {creator.city ? `${creator.city}, ` : ""}
            {formatCountry(creator.country ?? "")}
          </span>
        )}
        {hasFollowers && <FollowersCount count={followerCount} />}
        {hasSocials && (
          <SocialLinks
            creator={creator}
            className={`flex items-center gap-3 ${align === "right" ? "justify-end" : ""}`}
          />
        )}
      </div>
    );
  }

  return (
    <div class="flex items-center justify-center gap-3 text-sm text-on-surface">
      {hasLocation && (
        <span>
          {creator.city ? `${creator.city}, ` : ""}
          {formatCountry(creator.country ?? "")}
        </span>
      )}
      {hasFollowers && (
        <>
          {hasLocation && (
            <span aria-hidden="true" class="text-on-surface-weak">
              ·
            </span>
          )}
          <FollowersCount count={followerCount} />
        </>
      )}
      {hasSocials && (
        <>
          {(hasLocation || hasFollowers) && (
            <span aria-hidden="true" class="text-on-surface-weak">
              ·
            </span>
          )}
          <SocialLinks
            creator={creator}
            className="inline-flex items-center gap-3"
          />
        </>
      )}
    </div>
  );
};

export default CreatorBioMeta;
