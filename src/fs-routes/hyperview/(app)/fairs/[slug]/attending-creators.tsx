import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../../../lib/validator";
import FairAttendingCreators from "../../../../../features/hyperview/components/FairAttendingCreators";
import { hyperview } from "../../../../../lib/hxml";
import { getBaseUrl } from "../../../../../lib/hyperview";
import { getUser } from "../../../../../utils";
import { getFairBySlug } from "../../../../../features/app/fairs/services";
import { Text, View } from "../../../../../lib/hxml-comps";

const slugSchema = z.object({
  slug: z.string(),
});

export const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);

  const [error, fair] = await getFairBySlug(slug);
  if (error || !fair) {
    return hv(
      <View xmlns="https://hyperview.org/hyperview" id="fair-attending-creators">
        <Text style="featured-empty-hint">Could not load attending creators.</Text>
      </View>,
    );
  }

  return hv(
    <View xmlns="https://hyperview.org/hyperview">
      <FairAttendingCreators fairId={fair.id} baseUrl={baseUrl} user={user} />
    </View>,
  );
});
