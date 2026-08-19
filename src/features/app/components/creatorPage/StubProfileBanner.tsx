import Banner from "../../../../components/app/Banner";
import Link from "../../../../components/app/Link";
import Button from "../../../../components/app/Button";
import { Creator } from "../../../../db/schema";

type Props = {
  creator: Pick<Creator, "id" | "displayName" | "status">;
  isOwner: boolean;
};

const StubProfileBanner = ({ creator, isOwner }: Props) => {
  if (creator.status !== "stub" || isOwner) return <></>;

  const claimHref = `/claims/${creator.id}/start`;
  const persistKey = `stub-profile-banner-${creator.id}`;

  return (
    <div
      x-cloak
      x-data={`{ show: $persist(true).as('${persistKey}') }`}
      x-show="show"
    >
      <Banner
        type="info"
        message={`This profile was created by the Photobookers community from public information. Are you ${creator.displayName}?`}
      >
        <div class="flex flex-col items-center gap-2 sm:flex-row">
          <Link href={claimHref}>
            <Button variant="solid" color="primary">
              Claim your profile
            </Button>
          </Link>
          <button
            type="button"
            x-on:click="show = false"
            class="text-sm cursor-pointer hover:opacity-75"
          >
            Dismiss
          </button>
        </div>
      </Banner>
    </div>
  );
};

export default StubProfileBanner;
