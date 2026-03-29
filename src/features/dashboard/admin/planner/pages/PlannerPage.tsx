import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import NavTabs from "../../components/NavTabs";
import { AuthUser } from "../../../../../../types";
import { toWeekString } from "../../../../../lib/utils";
import { getWeekNumber, isWeekInPast } from "../utils";
import WeekCard from "../components/WeekCard";
import {
  getArtistsOfTheWeekByWeekStart,
  getBotwByWeekStart,
  getFeaturedBooksByWeekStart,
  getPublishersOfTheWeekByWeekStart,
} from "../services";
import { loadPlannerYearData } from "../queries";
import ErrorPage from "../../../../../pages/error/errorPage";

type Props = {
  user: AuthUser | null;
  year: number;
  weekStarts: Date[];
  currentPath: string;
};

const PlannerPage = async ({ user, year, weekStarts, currentPath }: Props) => {
  const {
    botwByWeekStart,
    featuredByWeekStart,
    artistByWeekStart,
    artistLoadError,
    publisherByWeekStart,
    publisherLoadError,
  } = await loadPlannerYearData(year);

  if (artistLoadError || publisherLoadError) {
    return <ErrorPage errorMessage="Failed to load planner year data" />;
  }

  const alpineAttrs = {
    "x-init": true,
    "x-on:planner:updated.window":
      "$ajax('/dashboard/admin/planner', { target: 'planner-grid' })",
  };

  return (
    <AppLayout title="BOTW Planner" user={user} currentPath={currentPath}>
      <Page>
        <NavTabs currentPath={currentPath} />
        <PlannerHeader year={year} />
        <div
          id="planner-grid"
          class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          {...alpineAttrs}
        >
          {weekStarts
            .filter((weekStart) => !isWeekInPast(weekStart))
            .map((weekStart) => {
              const key = toWeekString(weekStart);
              const botw = botwByWeekStart.get(key) ?? null;
              const featuredBooks = featuredByWeekStart.get(key) ?? [];
              const artistOfTheWeek = artistByWeekStart?.get(key) ?? null;
              const publisherOfTheWeek = publisherByWeekStart?.get(key) ?? null;

              return (
                <WeekCard
                  key={key}
                  weekStart={weekStart}
                  weekNumber={getWeekNumber(weekStart)}
                  bookOfTheWeek={botw}
                  featuredBooks={featuredBooks}
                  artistOfTheWeek={artistOfTheWeek}
                  publisherOfTheWeek={publisherOfTheWeek}
                />
              );
            })}
        </div>
      </Page>
    </AppLayout>
  );
};

export default PlannerPage;

const PlannerHeader = ({ year }: { year: number }) => {
  return (
    <div class="mb-6 flex flex-wrap items-center justify-between gap-4">
      <h1 class="text-xl font-semibold text-on-surface-strong">
        Book of the Week – {year}
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
