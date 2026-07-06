import { jsx } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { getBookComments } from "../../../../../../features/app/services.js";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text } from "../../../../../../lib/hxml-comps.js";
import { bookIdSchema } from "../../../../../../schemas/index.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { getUser } from "../../../../../../utils.js";
import BookCommentsPanel from "../../../../../../features/hyperview/components/BookCommentsPanel.js";
const GET = createRoute(paramValidator(bookIdSchema), async (c) => {
  const bookId = c.req.valid("param").bookId;
  const hv = hyperview(c);
  const baseUrl = getBaseUrl(c);
  const user = await getUser(c);
  const [commentsErr, comments] = await getBookComments(bookId);
  if (commentsErr || !comments) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Could not load comments." }) })
    );
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", children: /* @__PURE__ */ jsx(
      BookCommentsPanel,
      {
        bookId,
        baseUrl,
        user,
        comments
      }
    ) })
  );
});
export {
  GET
};
