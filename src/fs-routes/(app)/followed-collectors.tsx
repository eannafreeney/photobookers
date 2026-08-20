import { createRoute } from "hono-fsr";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import { getFollowedCollectors } from "../../domain/collectors/services";
import CollectorCircle from "../../features/app/components/CollectorCircle";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);

  if (!user?.id) {
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
              href="/creators?type=collector"
              class="text-accent underline underline-offset-2"
            >
              Discover collectors
            </a>
          </p>
        ) : (
          <ul class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {results.map((collector) => (
              <li>
                <CollectorCircle collector={collector} />
              </li>
            ))}
          </ul>
        )}
      </Page>
    </AppLayout>,
  );
});
