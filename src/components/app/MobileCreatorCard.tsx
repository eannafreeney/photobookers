import { AuthUser } from "../../../types";
import { Creator } from "../../db/schema";
import FollowButton from "../../features/api/components/FollowButton";
import CardCreatorCard from "./CardCreatorCard";

type Props = {
  creator: Creator | null;
  user: AuthUser | null;
};

const MobileCreatorCard = ({ creator, user }: Props) => {
  if (!creator) return <></>;

  return (
    <div class="flex items-center gap-2">
      <div class="grow">
        <CardCreatorCard creator={creator} avatarSize="sm" />
      </div>
      <div>
        <FollowButton creator={creator} variant="mobile" user={user} />
      </div>
    </div>
  );
};
export default MobileCreatorCard;
