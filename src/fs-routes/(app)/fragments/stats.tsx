import { createRoute } from "hono-fsr";
import { getHomepageStats } from "../../../features/app/services";

export const GET = createRoute(async (c) => {
  const [error, result] = await getHomepageStats();
  if (error) return c.html(<></>);
  const { books, artists, publishers } = result;
  if (!books || !artists || !publishers) return c.html(<></>);

  return c.html(
    <div id="stats-fragment" class="flex items-center gap-4 justify-evenly">
      <a href="/publishers">
        <div class="flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2 bg-surface shadow-sm">
          <div
            x-data={`countUp(${publishers})`}
            x-init="start()"
            x-text="display"
            class="text-2xl font-semibold"
          ></div>
          <p class="text-sm text-gray-500">Publishers</p>
        </div>
      </a>
      <a href="/artists">
        <div class="flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2 bg-surface shadow-sm">
          <div
            x-data={`countUp(${artists})`}
            x-init="start()"
            x-text="display"
            class="text-2xl font-semibold"
          ></div>
          <p class="text-sm text-gray-500">Artists</p>
        </div>
      </a>
      <a href="/books">
        <div class="flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2 bg-surface shadow-sm">
          <div
            x-data={`countUp(${books})`}
            x-init="start()"
            x-text="display"
            class="text-2xl font-semibold"
          ></div>
          <p class="text-sm text-gray-500">Books</p>
        </div>
      </a>
    </div>,
  );
});
