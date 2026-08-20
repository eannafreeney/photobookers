import { CreatorCardResult } from "../../constants/queries";
import { getInitialsAvatar } from "../../lib/avatar";
import { truncate } from "../../lib/utils";
import Avatar from "./Avatar";
import Card from "./Card";
import Link from "./Link";
import VerificationBadge from "./VerificationBadge";

type AuthorUser = {
  firstName: string | null;
  lastName: string | null;
  email?: string | null;
  profileImageUrl: string | null;
  shelfSlug: string | null;
  shelfPublic?: boolean | null;
};

type CardAuthorCardProps = {
  banner?: string;
  creator?: CreatorCardResult | null;
  user?: AuthorUser | null;
  avatarSize?: "xs" | "sm" | "md" | "lg";
  maxDisplayNameLength?: number;
};

type Identity = {
  displayName: string;
  title: string;
  avatarSrc: string;
  href: string | null;
  status: CreatorCardResult["status"] | null;
  /** Tooltip for VerificationBadge; collectors use "Verified Collector". */
  badgeTitle?: string;
};

const displayNameFor = (user: AuthorUser) =>
  [user.firstName, user.lastName].filter(Boolean).join(" ").trim() ||
  user.email ||
  "Unknown user";

function resolveIdentity(
  creator: CreatorCardResult | null | undefined,
  user: AuthorUser | null,
  maxDisplayNameLength?: number,
): Identity | null {
  if (creator) {
    const displayName =
      maxDisplayNameLength != null
        ? truncate(creator.displayName, maxDisplayNameLength)
        : (creator.displayName ?? "");
    return {
      displayName,
      title: creator.displayName,
      avatarSrc: creator.coverUrl ?? "",
      href: `/creators/${creator.slug}`,
      status: creator.status,
    };
  }

  if (!user) return null;

  const displayName = displayNameFor(user);
  const isPublicCollector = Boolean(user.shelfSlug && user.shelfPublic);
  return {
    displayName,
    title: displayName,
    avatarSrc:
      user.profileImageUrl ??
      getInitialsAvatar(user.firstName ?? "", user.lastName ?? ""),
    href: isPublicCollector ? `/shelf/${user.shelfSlug}` : null,
    // Same rule as shelf / collectors directory: public shelf ⇒ verified collector.
    status: isPublicCollector ? "verified" : null,
    badgeTitle: isPublicCollector ? "Verified Collector" : undefined,
  };
}

const CardAuthorCard = async ({
  banner,
  creator,
  user = null,
  avatarSize = "xs",
  maxDisplayNameLength,
}: CardAuthorCardProps) => {
  const identity = resolveIdentity(creator, user, maxDisplayNameLength);
  if (!identity) return <></>;

  const { displayName, title, avatarSrc, href, status, badgeTitle } = identity;
  const label = banner ?? displayName;
  const avatar = (
    <Avatar src={avatarSrc} alt={displayName} size={avatarSize} />
  );
  const name = <Card.SubTitle title={displayName}>{label}</Card.SubTitle>;

  return (
    <div class="flex min-w-0 items-center gap-2">
      {href ? (
        <Link href={href} className="shrink-0">
          {avatar}
        </Link>
      ) : (
        <div class="shrink-0">{avatar}</div>
      )}
      <div class="flex min-w-0 items-center gap-1">
        {href ? (
          <Link href={href} className="min-w-0 truncate" title={title}>
            {name}
          </Link>
        ) : (
          <div class="min-w-0 truncate" title={title}>
            {name}
          </div>
        )}
        {status != null ? (
          <div class="shrink-0">
            <VerificationBadge
              creatorStatus={status}
              size="xs"
              title={badgeTitle}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default CardAuthorCard;
