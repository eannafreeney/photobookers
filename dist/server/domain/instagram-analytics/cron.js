import {
  fetchInstagramData,
  generateInstagramInsights
} from "../../lib/instagram-graph.js";
import { sendAdminEmail } from "../../lib/sendEmail.js";
import { err, ok } from "../../lib/result.js";
import {
  buildInstagramWeeklyDigestEmail,
  instagramWeeklyDigestSubject
} from "./emails.js";
import { postsInLastDays } from "./stats.js";
function weekLabelFor(asOf) {
  const end = new Date(asOf);
  const start = new Date(asOf.getTime() - 6 * 24 * 60 * 60 * 1e3);
  const fmt = (d) => d.toISOString().slice(0, 10);
  return `${fmt(start)} \u2192 ${fmt(end)}`;
}
async function runInstagramWeeklyDigestCron(options = {}) {
  const asOf = options.date ?? /* @__PURE__ */ new Date();
  const weekLabel = weekLabelFor(asOf);
  const [fetchError, account] = await fetchInstagramData();
  if (fetchError) {
    return err({ reason: fetchError.message, cause: fetchError });
  }
  const weekPosts = postsInLastDays(account.recentPosts, 7, asOf);
  const forInsights = {
    ...account,
    recentPosts: weekPosts.length > 0 ? weekPosts : account.recentPosts
  };
  const insightsMarkdown = await generateInstagramInsights(forInsights);
  const subject = instagramWeeklyDigestSubject(weekLabel);
  const html = buildInstagramWeeklyDigestEmail({
    weekLabel,
    account,
    weekPosts,
    insightsMarkdown
  });
  if (options.dryRun) {
    return ok({
      action: "dry_run",
      weekLabel,
      postsInWindow: weekPosts.length,
      followers: account.followers_count
    });
  }
  const [emailError] = await sendAdminEmail(subject, html);
  if (emailError) {
    return err({ reason: emailError.reason, cause: emailError.cause });
  }
  return ok({
    action: "sent",
    weekLabel,
    postsInWindow: weekPosts.length,
    followers: account.followers_count
  });
}
export {
  runInstagramWeeklyDigestCron
};
