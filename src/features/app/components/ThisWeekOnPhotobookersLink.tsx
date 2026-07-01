import { thisWeekPath } from "../spotlightUrls";

const ThisWeekOnPhotobookersLink = () => {
  return (
    <a
      href={thisWeekPath()}
      class="group flex w-full flex-col items-center gap-1.5 border-2 border-on-surface-strong px-5 py-2 text-center transition-colors hover:bg-surface-alt"
    >
      <span class="inline-flex items-center font-display text-lg font-medium text-on-surface-strong sm:text-xl">
        This week on Photobookers
        <span>&nbsp;→</span>
      </span>
    </a>
  );
};

export default ThisWeekOnPhotobookersLink;
