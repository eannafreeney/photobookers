import { Fragment, jsx, jsxs } from "hono/jsx/jsx-runtime";
import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../../../../lib/validator.js";
import { weekQuerySchema } from "../../../../../../features/dashboard/admin/planner/schema.js";
import {
  generateSpotlightBlurbForKey,
  getWeekSpotlightBlurbEditorData
} from "../../../../../../features/dashboard/admin/planner/spotlightBlurb.js";
import { getWeekInstagramForPrepare } from "../../../../../../features/dashboard/admin/planner/social-media/instagramServices.js";
import { extractBracketedFormFields } from "../../../../../../features/dashboard/admin/planner/social-media/instagramUtils.js";
import { parseWeekString, toDateString } from "../../../../../../lib/utils.js";
import { showErrorAlert } from "../../../../../../lib/alertHelpers.js";
import Alert from "../../../../../../components/app/Alert.js";
const POST = createRoute(paramValidator(weekQuerySchema), async (c) => {
  const week = c.req.valid("param").week;
  const weekStart = parseWeekString(week);
  if (Number.isNaN(weekStart.getTime())) {
    return showErrorAlert(c, "Invalid week");
  }
  const body = await c.req.parseBody({ all: true });
  const fieldKey = Array.isArray(body.fieldKey) ? body.fieldKey[0] : body.fieldKey;
  if (typeof fieldKey !== "string" || !fieldKey.trim()) {
    return showErrorAlert(c, "Choose a spotlight entry to generate");
  }
  const blurbs = extractBracketedFormFields(body, "blurbs");
  const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
  if (loadError) return showErrorAlert(c, loadError.reason);
  const [editorError, items] = await getWeekSpotlightBlurbEditorData(weekData);
  if (editorError) return showErrorAlert(c, editorError.reason);
  const mergedItems = items.map((item) => {
    const key = item.kind === "botd" ? toDateString(item.date) : item.kind === "artist" ? "aotw" : "potw";
    return {
      ...item,
      currentBlurb: blurbs[key] ?? item.currentBlurb
    };
  });
  const currentItem = mergedItems.find((item) => {
    const key = item.kind === "botd" ? toDateString(item.date) : item.kind === "artist" ? "aotw" : "potw";
    return key === fieldKey;
  });
  const [generateError, generatedBlurb] = await generateSpotlightBlurbForKey(
    weekData,
    fieldKey
  );
  if (generateError) return showErrorAlert(c, generateError.reason);
  const notice = currentItem?.currentBlurb.trim() === generatedBlurb.trim() ? process.env.OPENAI_API_KEY ? {
    type: "warning",
    message: "Blurb generated, but it matched the current text so nothing visible changed."
  } : {
    type: "warning",
    message: "OpenAI is not configured here, so Generate reused the source text and nothing visible changed."
  } : {
    type: "success",
    message: "Generated a new spotlight blurb."
  };
  return c.html(
    /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx(Alert, { type: notice.type, message: notice.message }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          id: `blurbs-${fieldKey}`,
          name: `blurbs[${fieldKey}]`,
          rows: 6,
          "x-merge": "replace",
          class: "w-full rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface",
          children: generatedBlurb
        }
      )
    ] })
  );
});
export {
  POST
};
