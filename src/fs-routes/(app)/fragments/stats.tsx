import { createRoute } from "hono-fsr";
import { getHomepageStats } from "../../../features/app/services";
import { capitalize } from "../../../utils";
import Button from "../../../components/app/Button";

const entityIcons: Record<string, string> = {
  books: `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />`,
  artists: `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />`,
  publishers: `<path stroke-linecap="round" stroke-linejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />`,
};

export const GET = createRoute(async (c) => {
  const [error, result] = await getHomepageStats();
  if (error) return c.html(<></>);
  const { books, artists, publishers } = result;
  if (!books || !artists || !publishers) return c.html(<></>);

  return c.html(
    <div
      id="stats-fragment"
      class="flex flex-col md:flex-row items-center gap-4 justify-evenly"
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
  <div class="group mx-auto flex items-center gap-2 border border-outline rounded-radius px-8 py-2 bg-surface shadow-sm w-full md:min-w-50">
    <div class="flex items-center justify-between md:justify-center gap-4 w-full">
      <div class="flex items-center justify-center gap-4">
        <div
          x-data={`countUp(${count})`}
          x-init="start()"
          x-text="display"
          class="text-4xl font-semibold "
        ></div>
        <p class="text-lg text-gray-500 tracking-wide ">{capitalize(entity)}</p>
      </div>
      <a href={href}>
        <Button variant="outline" color="primary" width="fit">
          <span class="inline-flex items-center">
            View All
            <span class="w-0 overflow-hidden opacity-0 group-hover:w-6 group-hover:opacity-100 transition-all duration-300 ease-in-out whitespace-nowrap">
              &nbsp;→
            </span>
          </span>
        </Button>
      </a>
    </div>
  </div>
);
