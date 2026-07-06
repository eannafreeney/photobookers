import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { z } from "zod";
import { paramValidator } from "../../../../../lib/validator.js";
import FairAttendingCreators from "../../../../../features/hyperview/components/FairAttendingCreators.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { getUser } from "../../../../../utils.js";
import { getFairBySlug } from "../../../../../features/app/fairs/services.js";
import { Text, View } from "../../../../../lib/hxml-comps.js";
const slugSchema = z.object({
  slug: z.string()
});
const GET = createRoute(paramValidator(slugSchema), async (c) => {
  const slug = c.req.valid("param").slug;
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const hv = hyperview(c);
  const [error, fair] = await getFairBySlug(slug);
  if (error || !fair) {
    return hv(
      /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", id: "fair-attending-creators", children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Could not load attending creators." }) })
    );
  }
  return hv(
    /* @__PURE__ */ jsx(View, { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(FairAttendingCreators, { fairId: fair.id, baseUrl, user }) })
  );
});
export {
  GET
};
