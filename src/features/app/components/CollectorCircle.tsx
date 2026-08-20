import Link from "@/components/app/Link";
import VerificationBadge from "@/components/app/VerificationBadge";
import {
  collectorDisplayName,
  type CollectorCard,
} from "../../../domain/collectors/services";
import { getInitialsAvatar } from "../../../lib/avatar";
import { truncate } from "../../../lib/utils";
import { getImageSizeClass } from "../utils";

type Props = {
  collector: CollectorCard;
  size?: number;
  showType?: boolean;
};

const CollectorCircle = ({
  collector,
  size = 32,
  showType = false,
}: Props) => {
  if (!collector.shelfSlug) return <></>;

  const name = collectorDisplayName(collector);
  const avatarUrl =
    collector.profileImageUrl ??
    getInitialsAvatar(collector.firstName ?? "", collector.lastName ?? "");

  return (
    <div class="flex flex-col items-center gap-4">
      <a href={`/shelf/${collector.shelfSlug}`}>
        <div class="relative inline-block">
          <img
            src={avatarUrl}
            alt={name}
            title={name}
            class={`rounded-full object-cover ${getImageSizeClass(size)}`}
          />
          <div class="absolute top-0 right-3">
            <VerificationBadge
              creatorStatus="verified"
              size="sm"
              title="Verified Collector"
            />
          </div>
        </div>
        <div class="flex flex-col items-center gap-1">
          <Link href={`/shelf/${collector.shelfSlug}`}>
            <span class="text-sm font-medium">{truncate(name, 20)}</span>
          </Link>
          {showType ? (
            <span class="kicker text-on-surface-weak text-xs capitalize">
              collector
            </span>
          ) : null}
        </div>
      </a>
    </div>
  );
};

export default CollectorCircle;
