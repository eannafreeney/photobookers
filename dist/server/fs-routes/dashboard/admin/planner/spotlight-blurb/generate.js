import { createRoute } from "hono-fsr";
import { formValidator, queryValidator } from "../../../../../lib/validator.js";
import {
  spotlightBlurbQuerySchema,
  spotlightBlurbSaveSchema
} from "../../../../../features/dashboard/admin/planner/schema.js";
import {
  findSpotlightBlurbEditorItem,
  generateSpotlightBlurbForKey,
  getWeekSpotlightBlurbEditorData
} from "../../../../../features/dashboard/admin/planner/spotlightBlurb.js";
import { getWeekInstagramForPrepare } from "../../../../../features/dashboard/admin/planner/social-media/instagramServices.js";
import { parseWeekString } from "../../../../../lib/utils.js";
import { showErrorAlert } from "../../../../../lib/alertHelpers.js";
const POST = createRoute(
  queryValidator(spotlightBlurbQuerySchema),
  formValidator(spotlightBlurbSaveSchema),
  async (c) => {
    const { week, key } = c.req.valid("query");
    const { blurb } = c.req.valid("form");
    const weekStart = parseWeekString(week);
    if (Number.isNaN(weekStart.getTime())) {
      return showErrorAlert(c, "Invalid week");
    }
    const [loadError, weekData] = await getWeekInstagramForPrepare(weekStart);
    if (loadError) return showErrorAlert(c, loadError.reason);
    const [itemsError, items] = await getWeekSpotlightBlurbEditorData(weekData);
    if (itemsError) return showErrorAlert(c, itemsError.reason);
    const currentItem = findSpotlightBlurbEditorItem(items, key);
    if (!currentItem)
      return showErrorAlert(c, "Spotlight blurb item not found");
    const [generateError, generatedBlurb] = await generateSpotlightBlurbForKey(
      weekData,
      key
    );
    if (generateError) return showErrorAlert(c, generateError.reason);
    return c.text(generatedBlurb);
  }
);
export {
  POST
};
