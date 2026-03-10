import AppLayout from "../../../../../components/layouts/AppLayout";
import Page from "../../../../../components/layouts/Page";
import NavTabs from "../../components/NavTabs";
import { AuthUser } from "../../../../../../types";
import { toWeekString } from "../../../../../lib/utils";
import { getWeekNumber, isWeekInPast } from "../utils";
import WeekCard from "../components/WeekCard";
import { BookOfTheWeekWithBook } from "../../../../app/BOTWServices";
import { FeaturedBookOfTheWeekWithBook } from "../services";

type Props = {
  user: AuthUser | null;
  year: number;
  weekStarts: Date[];
  currentPath: string;
  botwByWeekStart: Map<string, BookOfTheWeekWithBook | null>;
  featuredByWeekStart: Map<string, FeaturedBookOfTheWeekWithBook[]>;
};

const PlannerPage = ({
  user,
  year,
  weekStarts,
  currentPath,
  botwByWeekStart,
  featuredByWeekStart,
}: Props) => {
  const alpineAttrs = {
    "x-init": true,
    "x-on:planner:updated.window":
      "$ajax('/dashboard/admin/planner', { target: 'planner-grid' })",
  };

  return (
    <AppLayout title="BOTW Planner" user={user}>
      <Page>
        <NavTabs currentPath={currentPath} />
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
            <span class="text-sm text-on-surface-weak">{year}</span>
            <a
              href={`/dashboard/admin/planner?year=${year + 1}`}
              class="rounded border border-outline bg-surface-alt px-3 py-1.5 text-sm font-medium text-on-surface hover:bg-surface"
            >
              {year + 1} →
            </a>
          </div>
        </div>
        <div
          id="planner-grid"
          class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          {...alpineAttrs}
        >
          {weekStarts
            .filter((weekStart) => !isWeekInPast(weekStart))
            .map((weekStart) => {
              const key = toWeekString(weekStart);
              const botw = botwByWeekStart.get(key) ?? null;
              const featuredBooks = featuredByWeekStart.get(key) ?? [];

              return (
                <WeekCard
                  key={key}
                  weekStart={weekStart}
                  weekNumber={getWeekNumber(weekStart)}
                  bookOfTheWeek={botw}
                  featuredBooks={featuredBooks}
                />
              );
            })}
        </div>
      </Page>
    </AppLayout>
  );
};

export default PlannerPage;
