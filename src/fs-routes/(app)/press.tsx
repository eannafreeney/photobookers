import { createRoute } from "hono-fsr";
import AppLayout from "../../components/layouts/AppLayout";
import Page from "../../components/layouts/Page";
import PageHeader from "../../components/app/PageHeader";
import InfoPage from "../../pages/InfoPage";
import PressClip from "../../features/app/components/PressClip";
import { listPressClips } from "../../features/app/press";
import { canonicalUrl, pageTitle, truncateDescription } from "../../lib/seo";
import { getUser } from "../../utils";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const [error, clips] = await listPressClips();
  if (error) return c.html(<InfoPage errorMessage={error.reason} user={user} />);

  const currentPath = c.req.path;
  const title = pageTitle("Press");
  const description = truncateDescription(
    "Reviews and features of photobooks collected on photobookers — coverage from journals, magazines, and independent outlets.",
  );

  return c.html(
    <AppLayout
      title={title}
      description={description}
      canonicalUrl={canonicalUrl(c.req.url, "/press")}
      currentPath={currentPath}
      user={user}
    >
      <Page>
        <div class="mx-auto flex w-full max-w-2xl flex-col gap-8">
          <PageHeader
            kicker="In the press"
            title="Press"
            intro="Reviews and features from journals, magazines, and independent outlets. Each clip links out to the original piece."
          />
          {clips.length === 0 ? (
            <p class="border-t border-outline pt-8 text-on-surface">
              No press collected yet.
            </p>
          ) : (
            <ul class="flex flex-col gap-4 border-t border-outline pt-8">
              {clips.map((clip) => (
                <PressClip clip={clip} />
              ))}
            </ul>
          )}
        </div>
      </Page>
    </AppLayout>,
  );
});
