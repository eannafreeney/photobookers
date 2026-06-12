import { createRoute } from "hono-fsr";
import { getHomepageStats } from "../../../features/app/services";
import { capitalize } from "../../../utils";

export const GET = createRoute(async (c) => {
  const [error, result] = await getHomepageStats();
  if (error) return c.html(<></>);
  const { books, artists, publishers } = result;
  if (!books || !artists || !publishers) return c.html(<></>);

  return c.html(
    <div
      id="stats-fragment"
      class="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6"
    >
      <StatsCard entity="books" count={books} href="/books" />
      <StatsCard entity="artists" count={artists} href="/artists" />
      <StatsCard entity="publishers" count={publishers} href="/publishers" />
    </div>,
  );
});

type StatsCardProps = {
  entity: string;
  count: number;
  href: string;
};

const StatsCard = ({ entity, count, href }: StatsCardProps) => (
  <a
    href={href}
    class="group mx-auto flex w-full flex-col gap-1 border-t-2 border-on-surface-strong pt-3 md:min-w-50"
  >
    <span class="kicker text-accent">{capitalize(entity)}</span>
    <div class="flex items-center justify-between gap-4">
      <div
        x-data={`countUp(${count})`}
        x-init="start()"
        x-text="display"
        class="font-display text-5xl font-medium text-on-surface-strong"
      />
      <span class="kicker text-on-surface-weak group-hover:text-on-surface-strong transition-colors">
        <span class="inline-flex items-center">
          View All
          <span class="w-0 overflow-hidden opacity-0 group-hover:w-4 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap">
            &nbsp;→
          </span>
        </span>
      </span>
    </div>
  </a>
);
