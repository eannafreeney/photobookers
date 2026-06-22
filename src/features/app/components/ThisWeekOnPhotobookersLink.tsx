import { thisWeekPath } from "../spotlightUrls";

const ThisWeekOnPhotobookersLink = () => {
  return (
    <a
      href={thisWeekPath()}
      class="group flex w-full flex-col items-center gap-1.5 border-2 border-on-surface-strong px-5 py-2 text-center transition-colors hover:bg-surface-alt"
    >
      <span class="inline-flex items-center font-display text-lg font-medium text-on-surface-strong sm:text-xl">
        This week on Photobookers
        <span
          class="inline-block whitespace-nowrap transition-all duration-300 ease-in-out
         md:w-0 md:overflow-hidden md:opacity-0
         md:group-hover:w-6 md:group-hover:opacity-100"
        >
          &nbsp;→
        </span>
      </span>
    </a>
  );
};

export default ThisWeekOnPhotobookersLink;
