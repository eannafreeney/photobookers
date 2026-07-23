import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import { isFeatureEnabledForUser } from "../../lib/features";
import {
  CollectorCard,
  getFollowedCollectors,
} from "../../domain/collectors/services";
import { getInitialsAvatar } from "../../lib/avatar";

const collectorName = (c: CollectorCard) =>
  [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || "Collector";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);

  if (!isFeatureEnabledForUser("collectors", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const [err, collectors] = await getFollowedCollectors(user.id);
  if (err) return c.html(<InfoPage errorMessage={err.reason} user={user} />);

  const results = collectors ?? [];
  const title = "Collectors I Follow";

  return c.html(
    <AppLayout title={title} user={user} noIndex>
      <Page>
        <PageHeader kicker="Your People" title={title} />
        {results.length === 0 ? (
          <p class="text-sm text-on-surface">
            You're not following any public collectors yet.{" "}
            <a
              href="/collectors"
              class="text-accent underline underline-offset-2"
            >
              Discover collectors
            </a>
          </p>
        ) : (
          <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((collector) => {
              const name = collectorName(collector);
              const avatarUrl =
                collector.profileImageUrl ??
                getInitialsAvatar(
                  collector.firstName ?? "",
                  collector.lastName ?? "",
                );
              return (
                <li>
                  <a
                    href={`/shelf/${collector.shelfSlug}`}
                    class="flex flex-col items-center gap-2 rounded-radius border border-outline bg-surface p-4 text-center transition-colors hover:border-outline-strong"
                  >
                    <img
                      src={avatarUrl}
                      alt={name}
                      class="size-16 rounded-full object-cover"
                      loading="lazy"
                    />
                    <span class="truncate text-sm font-medium text-on-surface-strong">
                      {name}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </Page>
    </AppLayout>,
  );
});
