import { jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { hyperview } from "../../../../../../lib/hxml.js";
import { Text, View } from "../../../../../../lib/hxml-comps.js";
import { getBaseUrl } from "../../../../../../lib/hyperview.js";
import { creatorIdSchema } from "../../../../../../schemas/index.js";
import { getMessagesByCreator } from "../../../../../../features/dashboard/messages/services.js";
import { formatDate } from "../../../../../../utils.js";
const GET = createRoute(paramValidator(creatorIdSchema), async (c) => {
  const creatorId = c.req.valid("param").creatorId;
  const baseUrl = getBaseUrl(c);
  const hv = hyperview(c);
  const [error, result] = await getMessagesByCreator(creatorId);
  if (error || !result) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "Posts not found." }) }),
      404
    );
  }
  const { messages } = result;
  if (messages.length === 0) {
    return hv(
      /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: /* @__PURE__ */ jsx(Text, { style: "comments-placeholder", children: "No posts yet." }) }),
      404
    );
  }
  return hv(
    /* @__PURE__ */ jsx("view", { xmlns: "https://hyperview.org/hyperview", style: "tab-fragment", children: messages.map((message) => /* @__PURE__ */ jsxs(View, { style: "message-row", children: [
      /* @__PURE__ */ jsx(Text, { style: "message-date", children: formatDate(message.createdAt ?? /* @__PURE__ */ new Date()) }),
      /* @__PURE__ */ jsx(Text, { style: "message-preview", children: message.body })
    ] }, message.id)) })
  );
});
export {
  GET
};
