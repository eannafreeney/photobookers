import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../../lib/validator";
import { AppLayout } from "../../+layout";
import { hyperview } from "../../../../lib/hxml";
import { Style, View } from "../../../../lib/hxml-comps";
import { getBaseUrl } from "../../../../lib/hyperview";
import { getUser } from "../../../../utils";
import { isFeatureEnabledForUser } from "../../../../lib/features";
import { getFairBySlug } from "../../../../features/app/fairs/services";
import { isCreatorAttendingFair } from "../../../../features/fair-attendees/services";
import { recordFairView } from "../../../../features/fair-views/services";
import FairDetailBody, {
  fairDetailBodyStyles,
} from "../../../../features/hyperview/components/FairDetailBody";
import { signInEmptyHintStyles } from "../../../../features/hyperview/hyperviewCommonScreenStyles";
import ErrorScreen from "../../../../features/hyperview/components/ErrorScreen";

const slugSchema = z.object({
  slug: z.string(),
});

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  if (!isFeatureEnabledForUser("fairs", user)) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Not found" />,
      404,
    );
  }

  const [error, fair] = await getFairBySlug(slug);
  if (error) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message={error.reason} />,
      404,
    );
  }

  const isPublished =
    fair.status === "published" && fair.approvalStatus === "approved";

  if (!isPublished && !user?.isAdmin) {
    return hv(
      <ErrorScreen user={user} baseUrl={baseUrl} message="Fair not found" />,
      404,
    );
  }

  if (isPublished) {
    await recordFairView({
      fairId: fair.id,
      userId: user?.id,
      source: "hyperview",
    });
  }

  let isAttending = false;
  if (user?.creator) {
    const [attendingError, attending] = await isCreatorAttendingFair(
      fair.id,
      user.creator.id,
    );
    if (!attendingError) {
      isAttending = attending;
    }
  }

  return hv(
    <AppLayout
      title={fair.name}
      user={user}
      baseUrl={baseUrl}
      fixedHeader
      extraStyles={pageStyles()}
    >
      <View style="page-content">
        <FairDetailBody
          fair={fair}
          user={user}
          baseUrl={baseUrl}
          isAttending={isAttending}
        />
      </View>
    </AppLayout>,
  );
});

const pageStyles = () => (
  <>
    {signInEmptyHintStyles()}
    {fairDetailBodyStyles()}
  </>
);
