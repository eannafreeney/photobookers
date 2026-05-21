import { createRoute } from "hono-fsr";
import { getFollowedCreators } from "../../../../../features/app/services";
import { hyperview } from "../../../../../lib/hxml";
import { Text } from "../../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";
import CreatorsList, {
  CreatorsListMessage,
} from "../../../../../features/hyperview/components/CreatorsList";
import SignInPrompt from "../../../../../features/hyperview/components/SignInPrompt";

export const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);

  if (!user) {
    return hv(
      <SignInPrompt
        variant="fragment"
        baseUrl={baseUrl}
        hint="Sign in to see creators you follow."
      />,
    );
  }

  const [error, result] = await getFollowedCreators(user.id);

  if (error) {
    return hv(
      <CreatorsListMessage>
        <Text style="featured-empty-hint">
          Failed to load followed creators.
        </Text>
      </CreatorsListMessage>,
    );
  }

  const creators = [
    ...(result?.artists ?? []),
    ...(result?.publishers ?? []),
  ].sort((a, b) => a.displayName.localeCompare(b.displayName));

  if (creators.length === 0) {
    return hv(
      <CreatorsListMessage>
        <Text style="featured-empty-hint">
          You are not following any creators yet. Browse the All tab to discover
          artists and publishers.
        </Text>
      </CreatorsListMessage>,
    );
  }

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <CreatorsList
        creators={creators}
        baseUrl={baseUrl}
        page={1}
        hasMore={false}
      />
    </view>,
  );
});
