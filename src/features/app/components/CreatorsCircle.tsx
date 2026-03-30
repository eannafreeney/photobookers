import Link from "../../../components/app/Link";
import VerifiedCreator from "../../../components/app/VerifiedCreator";
import { CreatorCardResult } from "../../../constants/queries";
import { truncate } from "../../../lib/utils";
import { getImageSizeClass } from "../utils";

type Props = {
  creator: CreatorCardResult;
  size?: number;
};

const CreatorsCircle = ({ creator, size = 32 }: Props) => {
  if (!creator) return <></>;

  return (
    <div class="flex flex-col items-center gap-4">
      <a href={`/creators/${creator.slug}`} key={creator.id ?? creator.slug}>
        <div class="relative inline-block">
          <img
            src={creator.coverUrl ?? ""}
            alt={creator.displayName ?? ""}
            title={creator.displayName ?? ""}
            class={`rounded-full object-cover ${getImageSizeClass(size)}`}
          />
          <div class="absolute top-0 right-3">
            <VerifiedCreator creatorStatus={creator.status} size="sm" />
          </div>
        </div>
        <Link href={`/creators/${creator.slug}`}>
          <span class="text-sm font-medium">
            {truncate(creator.displayName ?? "", 20)}
          </span>
        </Link>
      </a>
    </div>
  );
};

export default CreatorsCircle;
