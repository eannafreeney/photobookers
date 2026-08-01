import { err, ok } from "../../../lib/result.js";
import { toWeekStart } from "../../../lib/utils.js";
import { getWeekDays } from "../../../features/dashboard/admin/planner/utils.js";
import {
  ensureWeekFeaturedImages,
  getWeekInstagramForPrepare
} from "../../../features/dashboard/admin/planner/social-media/instagramServices.js";
import {
  autoSetArtistOfTheWeek,
  autoSetPublisherOfTheWeek,
  randomizeBooksOfTheDayForWeek
} from "../../../features/dashboard/admin/planner/services.js";
async function ensureWeekPlannerContent(weekStart) {
  const normalized = toWeekStart(weekStart);
  const warnings = [];
  let botdScheduled = 0;
  let botdAutoFilled = false;
  let artistAutoFilled = false;
  let publisherAutoFilled = false;
  const [initialLoadError, initialWeek] = await getWeekInstagramForPrepare(normalized);
  if (initialLoadError) return err({ reason: initialLoadError.reason });
  const weekDays = getWeekDays(normalized);
  if (initialWeek.botdEntries.length < weekDays.length) {
    const [randError, randResult] = await randomizeBooksOfTheDayForWeek(normalized);
    if (randError) {
      warnings.push(randError.reason);
    } else {
      botdScheduled = randResult.scheduled;
      botdAutoFilled = randResult.scheduled > 0;
    }
  }
  const [reloadError, weekData] = await getWeekInstagramForPrepare(normalized);
  if (reloadError) return err({ reason: reloadError.reason });
  if (!weekData.artistOfTheWeek) {
    const [artistError, artistResult] = await autoSetArtistOfTheWeek(normalized);
    if (artistError) {
      warnings.push(artistError.reason);
    } else {
      artistAutoFilled = artistResult.created;
    }
  }
  if (!weekData.publisherOfTheWeek) {
    const [publisherError, publisherResult] = await autoSetPublisherOfTheWeek(normalized);
    if (publisherError) {
      warnings.push(publisherError.reason);
    } else {
      publisherAutoFilled = publisherResult.created;
    }
  }
  const [imageError, imageResult] = await ensureWeekFeaturedImages(normalized);
  if (imageError) {
    warnings.push(imageError.reason);
  }
  return ok({
    botdScheduled,
    botdAutoFilled,
    artistAutoFilled,
    publisherAutoFilled,
    imagesSaved: imageResult?.saved ?? 0,
    warnings
  });
}
export {
  ensureWeekPlannerContent
};
