import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import { getContributorLeaderboard, type LeaderboardEntry } from "../../domain/contributors/services";
import { canonicalUrl, pageTitle } from "../../lib/seo";

function displayName(entry: LeaderboardEntry) {
  return [entry.firstName, entry.lastName].filter(Boolean).join(" ") || "Anonymous";
}

const LeaderboardRow = ({ entry, rank }: { entry: LeaderboardEntry; rank: number }) => (
  <a
    href={entry.shelfSlug ? `/contributors/${entry.shelfSlug}` : undefined}
    class="flex items-center justify-between gap-4 border-t border-outline py-3 hover:bg-surface-alt/50 px-2 -mx-2 rounded transition-colors"
  >
    <div class="flex items-center gap-4">
      <span class="text-2xl font-display font-medium text-on-surface-weak w-8 text-right">
        {rank}
      </span>
      {entry.profileImageUrl ? (
        <img
          src={entry.profileImageUrl}
          alt=""
          class="w-10 h-10 rounded-full object-cover"
        />
      ) : (
        <div class="w-10 h-10 rounded-full bg-surface-alt flex items-center justify-center text-on-surface-weak text-sm font-medium">
          {(entry.firstName?.[0] ?? "?").toUpperCase()}
        </div>
      )}
      <span class="font-medium text-on-surface-strong">{displayName(entry)}</span>
    </div>
    <span class="text-sm text-on-surface-weak">
      {entry.bookCount} book{entry.bookCount !== 1 ? "s" : ""}
    </span>
  </a>
);

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const currentPath = c.req.path;
  const leaderboard = await getContributorLeaderboard();
  const title = pageTitle("Contributors");

  return c.html(
    <AppLayout
      title={title}
      description="People who contribute books to Photobookers"
      canonicalUrl={canonicalUrl(c.req.url, "/leaderboard")}
      currentPath={currentPath}
      user={user}
    >
      <Page>
        <PageHeader
          kicker="Community"
          title="Contributors"
          intro="These people help grow the Photobookers catalog by submitting books for review."
        />
        {leaderboard.length > 0 ? (
          <div class="flex flex-col mt-8 max-w-xl">
            {leaderboard.map((entry, i) => (
              <LeaderboardRow entry={entry} rank={i + 1} />
            ))}
          </div>
        ) : (
          <p class="text-on-surface-weak mt-8">No contributors yet.</p>
        )}
      </Page>
    </AppLayout>,
  );
});
