import { createRoute } from "hono-fsr";
import { getUser } from "../../../../utils";
import {
  getWeekNumber,
  getWeekStarts,
  isWeekInPast,
} from "../../../../features/dashboard/admin/planner/utils";
import AppLayout from "../../../../components/layouts/AppLayout";
import Page from "../../../../components/layouts/Page";
import { toWeekString } from "../../../../lib/utils";
import WeekCard from "../../../../features/dashboard/admin/planner/components/WeekCard";
import InfoPage from "../../../../pages/InfoPage";
import { loadPlannerYearData } from "../../../../features/dashboard/admin/planner/queries";
import Sidebar from "../../../../components/app/Sidebar";

export const GET = createRoute(async (c) => {
  const user = await getUser(c);
  const year = Number(c.req.query("year") ?? new Date().getFullYear());
  const weekStarts = getWeekStarts(year);
  const currentPath = c.req.path;

  const {
    botdByDate,
    artistByWeekStart,
    artistLoadError,
    publisherByWeekStart,
    publisherLoadError,
    instagramPreparedByWeekStart,
    interviewByCreatorId,
  } = await loadPlannerYearData(year);

  if (artistLoadError || publisherLoadError) {
    return c.html(
      <InfoPage errorMessage="Failed to load planner year data" user={user} />,
    );
  }

  const alpineAttrs = {
    "x-init": true,
    "x-on:planner:updated.window":
      "$ajax('/dashboard/admin/planner', { target: 'planner-grid' })",
  };

  return c.html(
    <AppLayout title="BOTD Planner" user={user} currentPath={currentPath}>
      <Page>
        <Sidebar currentPath={currentPath}>
          <PlannerHeader year={year} />
          <div
            id="planner-grid"
            class="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            {...alpineAttrs}
          >
            {weekStarts
              .filter((weekStart) => !isWeekInPast(weekStart))
              .map((weekStart) => {
                const key = toWeekString(weekStart);
                const artistOfTheWeek = artistByWeekStart?.get(key) ?? null;
                const publisherOfTheWeek =
                  publisherByWeekStart?.get(key) ?? null;
                const instagramPrepared =
                  instagramPreparedByWeekStart.get(key) ?? false;

                return (
                  <WeekCard
                    key={key}
                    weekStart={weekStart}
                    weekNumber={getWeekNumber(weekStart)}
                    botdByDate={botdByDate}
                    artistOfTheWeek={artistOfTheWeek}
                    publisherOfTheWeek={publisherOfTheWeek}
                    instagramPrepared={instagramPrepared}
                    interviewByCreatorId={interviewByCreatorId}
                  />
                );
              })}
          </div>
        </Sidebar>
      </Page>
    </AppLayout>,
  );
});

const PlannerHeader = ({ year }: { year: number }) => {
  return (
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-xl font-semibold text-on-surface-strong">
        Book of the Day – {year}
      </h1>
      <div class="flex items-center gap-2">
        <a
          href={`/dashboard/admin/planner?year=${year - 1}`}
          class="rounded border border-outline bg-surface-alt px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface"
        >
          ← {year - 1}
        </a>
        <span class="text-sm text-on-surface">{year}</span>
        <a
          href={`/dashboard/admin/planner?year=${year + 1}`}
          class="rounded border border-outline bg-surface-alt px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface"
        >
          {year + 1} →
        </a>
      </div>
    </div>
  );
};
