import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { getCreatorsByCreatorId } from "../../../../../../features/app/services.js";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Style, Text } from "../../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { getUser } from "../../../../../../utils.js";
import { followFlagsForCreators } from "../../../../../../features/hyperview/findFlags.js";
import RelatedCreatorsList, {
  relatedCreatorsListStyles
} from "../../../../../../features/hyperview/components/RelatedCreatorsList.js";
import { creatorIdSchema } from "../../../../../../schemas/index.js";
import { followButtonStyles } from "../../../../../../features/hyperview/components/FollowButton.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const currentPage = Number(c.req.query("page") ?? 1);
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [error, result] = await getCreatorsByCreatorId(
    creatorId,
    "artist",
    currentPage
  );
  if (error || !result) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Artist not found." }) }),
      404
    );
  }
  const { creators, totalPages = 1 } = result;
  const hasMore = currentPage < totalPages;
  const loadMoreHref = `${baseUrl}/hyperview/creators/${creatorId}/tab/publishers`;
  const followingByCreatorId = await followFlagsForCreators(
    user,
    creators ?? []
  );
  if (currentPage === 1 && creators.length === 0) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "No publishers found." }) })
    );
  }
  const list = /* @__PURE__ */ jsx(
    RelatedCreatorsList,
    {
      creators,
      role: "Publisher",
      baseUrl,
      page: currentPage,
      hasMore,
      loadMoreHref,
      followingByCreatorId
    }
  );
  if (currentPage > 1) {
    return hv(/* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: list }));
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: list })
  );
});
const publishersListStyles = () => /* @__PURE__ */ jsxs(Fragment, { children: [
  /* @__PURE__ */ jsx(Style, { id: "related-creators-list", flexDirection: "column", gap: 12 }),
  relatedCreatorsListStyles(),
  followButtonStyles()
] });
export {
  GET,
  publishersListStyles
};
