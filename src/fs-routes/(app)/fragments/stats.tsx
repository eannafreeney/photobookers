import { createRoute } from "hono-fsr";
import { getHomepageStats } from "../../../features/app/services";
import { capitalize } from "../../../utils";
import Button from "../../../components/app/Button";

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
