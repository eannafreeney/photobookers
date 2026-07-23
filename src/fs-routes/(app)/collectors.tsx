import { createRoute } from "hono-fsr";
import { Context } from "hono";
import { getUser } from "../../utils";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import { isFeatureEnabledForUser } from "../../lib/features";
import { getPublicCollectors } from "../../domain/collectors/services";
import { getInitialsAvatar } from "../../lib/avatar";
import { pageTitle } from "../../lib/seo";

const collectorName = (c: {
  firstName: string | null;
  lastName: string | null;
}) => [c.firstName, c.lastName].filter(Boolean).join(" ").trim() || "Collector";

export const GET = createRoute(async (c: Context) => {
  const user = await getUser(c);
  const currentPath = c.req.path;

  if (!isFeatureEnabledForUser("collectors", user)) {
    return c.html(<InfoPage errorMessage="Not found" user={user} />, 404);
  }

  const searchQuery = c.req.query("search")?.trim() ?? "";
  const [error, collectors] = await getPublicCollectors(searchQuery);
  const results = error || !collectors ? [] : collectors;

  return c.html(
    <AppLayout
      title={pageTitle("Collectors")}
      description="Discover collectors and browse their shelves."
      user={user}
      currentPath={currentPath}
    >
      <Page>
        <PageHeader
          title="Collectors"
          intro="Discover collectors and browse the photobooks they love."
        />

        <form method="get" action="/collectors" class="mb-6 flex gap-2">
          <input
            type="search"
            name="search"
            value={searchQuery}
            placeholder="Search collectors by name"
            class="w-full max-w-md rounded border border-outline bg-surface px-3 py-2 text-sm text-on-surface"
            autocomplete="off"
          />
          <button
            type="submit"
            class="rounded-radius border border-secondary px-4 py-2 text-sm font-medium text-secondary hover:opacity-75"
          >
            Search
          </button>
        </form>

        {results.length === 0 ? (
          <p class="text-sm text-on-surface">
            {searchQuery
              ? `No collectors found for "${searchQuery}".`
              : "No public collectors yet."}
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
