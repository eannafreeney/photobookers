import { Behavior, Text, View } from "../../../lib/hxml-comps";

type Props = {
  creatorId: string;
  baseUrl: string;
  isActive: boolean;
};

export const HyperviewFollowInner = ({
  creatorId,
  baseUrl,
  isActive,
}: Props) => (
  <>
    <Text style="follow-label">{isActive ? "Following ✓" : "Follow +"}</Text>
    <Behavior
      action="replace-inner"
      verb="post"
      href={`${baseUrl}/api/creators/${creatorId}/follow`}
      target={`follow-btn-${creatorId}`}
    />
  </>
);

const FollowButton = ({ creatorId, baseUrl, isActive }: Props) => {
  return (
    <View style="follow-btn" id={`follow-btn-${creatorId}`}>
      <HyperviewFollowInner
        creatorId={creatorId}
        baseUrl={baseUrl}
        isActive={isActive}
      />
    </View>
  );
};

export default FollowButton;
