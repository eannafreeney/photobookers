import { getHomepageStats } from "../services";

const StatsFragment = async () => {
  const stats = await getHomepageStats();
  return (
    <div
      id="stats-fragment"
      class="flex items-center gap-4 my-6 justify-evenly"
    >
      <a href="/publishers">
        <div class="flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2">
          <p class="text-2xl font-semibold">{stats.publishers}</p>
          <p class="text-sm text-gray-500">Publishers</p>
        </div>
      </a>
      <a href="/artists">
        <div class="flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2">
          <p class="text-2xl font-semibold">{stats.artists}</p>
          <p class="text-sm text-gray-500">Artists</p>
        </div>
      </a>
      <a href="/books">
        <div class="flex flex-col md:flex-row items-center gap-2 border border-outline rounded-radius px-4 py-2">
          <p class="text-2xl font-semibold">{stats.books}</p>
          <p class="text-sm text-gray-500">Books</p>
        </div>
      </a>
    </div>
  );
};

export default StatsFragment;
