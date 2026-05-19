import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator";
import { hyperview } from "../../../../../../lib/hxml";
import { Behavior, Image, Text, View } from "../../../../../../lib/hxml-comps";
import CreatorCard from "../../../../../../features/hyperview/components/CreatorCard";
import { getBaseUrl } from "../../../../../../lib/hyperview";
import { getCreatorById } from "../../../../../../features/dashboard/creators/services";
import { creatorIdSchema } from "../../../../../../schemas";

export const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;

  const hv = hyperview(c);

  const [error, creator] = await getCreatorById(creatorId);

  if (error || !creator) {
    return hv(
      <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
        <Text style="comments-placeholder">Artist not found.</Text>
      </view>,
      404,
    );
  }
  const hasSocials = creator.website || creator.instagram || creator.twitter;

  return hv(
    <view xmlns="https://hyperview.org/hyperview" style="tab-fragment">
      <Text style="comments-placeholder">
        {creator.bio ?? "No bio available"}
      </Text>
      {hasSocials && (
        <View style="creator-socials">
          {creator.website && (
            <View style="social-btn">
              <Text style="social-label">🌐 Website</Text>
              <Behavior
                trigger="press"
                action="deep-link"
                href={creator.website}
              />
            </View>
          )}
          {creator.instagram && (
            <View style="social-btn">
              <Text style="social-label">Instagram</Text>
              <Behavior
                trigger="press"
                action="deep-link"
                href={`https://instagram.com/${creator.instagram.replace(/^@/, "")}`}
              />
            </View>
          )}
          {creator.twitter && (
            <View style="social-btn">
              <Text style="social-label">𝕏 Twitter</Text>
              <Behavior
                trigger="press"
                action="deep-link"
                href={`https://x.com/${creator.twitter.replace(/^@/, "")}`}
              />
            </View>
          )}
        </View>
      )}
    </view>,
  );
});
