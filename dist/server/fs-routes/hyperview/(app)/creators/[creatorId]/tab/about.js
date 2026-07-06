import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import { getCreatorById } from "../../../../../../features/dashboard/creators/services.js";
import { creatorIdSchema } from "../../../../../../schemas/index.js";
import CreatorSocialLinks from "../../../../../../features/hyperview/components/CreatorSocialLinks.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  const [error, creator] = await getCreatorById(creatorId);
  if (error || !creator) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Artist not found." }) }),
      404
    );
  }
  return hv(
    /* @__PURE__ */ jsxs("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: [
      /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: creator.bio ?? "No bio available" }),
      /* @__PURE__ */ jsx(
        CreatorSocialLinks,
        {
          baseUrl,
          website: creator.website,
          instagram: creator.instagram,
          twitter: creator.twitter,
          facebook: creator.facebook
        }
      )
    ] })
  );
});
export {
  GET
};
