import { createRoute } from "hono-fsr";
import { paramValidator } from "../../../lib/validator";
import { getUser } from "../../../utils";
import AppLayout from "../../../components/layouts/AppLayout";
import Page from "../../../components/layouts/Page";
import InfoPage from "../../../pages/InfoPage";
import NewsletterCard from "../../../features/app/components/NewsletterCard";
import { aotwPath } from "../../../features/app/spotlightUrls";
import { canonicalUrl, pageTitle, truncateDescription } from "../../../lib/seo";
import { toWeekString } from "../../../lib/utils";
import { getArtistOfTheWeekForDateQuery } from "../../../features/app/AOTWServices";
import CreatorCard from "../../../components/app/CreatorCard";
import { weekParamSchema } from "../../../features/app/schema"; // or inline zod

export const GET = createRoute(paramValidator(weekParamSchema), async (c) => {
  const user = await getUser(c);
  const weekStart = c.req.valid("param").week;
  const currentPath = c.req.path;

  const [error, artistOfTheWeek] =
    await getArtistOfTheWeekForDateQuery(weekStart);
  if (error) {
    return c.html(
      <InfoPage errorMessage="Artist of the week not found" user={user} />,
      404,
    );
  }

  const { creator } = artistOfTheWeek;
  const editorial = artistOfTheWeek.instagramCaption?.trim() || null;
  const path = aotwPath(weekStart);
  const weekLabel = toWeekString(weekStart);
  const title = pageTitle(`Artist of the Week — ${creator.displayName}`);
  const description = truncateDescription(
    editorial ??
      `${creator.displayName}. Photobookers Artist of the Week for ${weekLabel}.`,
  );

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, path)}
      user={user}
      currentPath={currentPath}
      shareOg={{
        title,
        description,
        image:
          artistOfTheWeek.instagramImageUrl ?? creator.coverUrl ?? undefined,
        url: canonicalUrl(c.req.url, path),
      }}
    >
      <Page>
        <p class="text-sm text-on-surface-strong font-medium">
          Artist of the Week · {weekLabel}
        </p>
        <h1 class="text-3xl font-bold mt-2">{creator.displayName}</h1>
        {editorial ? (
          <p class="mt-6 text-on-surface whitespace-pre-line">{editorial}</p>
        ) : null}
        <div class="mt-8">
          <CreatorCard
            creator={creator}
            user={user}
            currentPath={currentPath}
          />
        </div>
        <div class="mt-10">
          <NewsletterCard />
        </div>
        <p class="mt-8 text-sm">
          <a href="/artist-of-the-week" class="underline">
            ← All Artists of the Week
          </a>
        </p>
      </Page>
    </AppLayout>,
  );
});
