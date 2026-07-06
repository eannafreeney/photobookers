import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { getFollowedCreators } from "../../../../../features/app/services.js";
import { hyperview } from "../../../../../lib/hxml.js";
import { Text } from "../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../lib/hyperview.js";
import { getUser } from "../../../../../utils.js";
import CreatorsList, {
  CreatorsListMessage
} from "../../../../../features/hyperview/components/CreatorsList.js";
import SignInPrompt from "../../../../../features/hyperview/components/SignInPrompt.js";
const GET = createRoute(async (c) => {
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  if (!user) {
    return hv(
      /* @__PURE__ */ jsx(
        SignInPrompt,
        {
          variant: "fragment",
          baseUrl,
          hint: "Sign in to see creators you follow."
        }
      )
    );
  }
  const [error, result] = await getFollowedCreators(user.id);
  if (error) {
    return hv(
      /* @__PURE__ */ jsx(CreatorsListMessage, { children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "Failed to load followed creators." }) })
    );
  }
  const creators = [
    ...result?.artists ?? [],
    ...result?.publishers ?? []
  ].sort((a, b) => a.displayName.localeCompare(b.displayName));
  if (creators.length === 0) {
    return hv(
      /* @__PURE__ */ jsx(CreatorsListMessage, { children: /* @__PURE__ */ jsx(Text, { style: "featured-empty-hint", children: "You are not following any creators yet. Browse the All tab to discover artists and publishers." }) })
    );
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(
      CreatorsList,
      {
        creators,
        baseUrl,
        page: 1,
        hasMore: false
      }
    ) })
  );
});
export {
  GET
};
