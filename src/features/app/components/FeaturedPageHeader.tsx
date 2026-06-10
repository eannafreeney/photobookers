import { toWeekString } from "../../../lib/utils";

type Props = {
  title: string;
  name: string;
  weekStart: Date;
  location?: string | null;
};

const FeaturedPageHeader = ({ title, name, weekStart, location }: Props) => (
  <div class="flex flex-col items-center gap-3 border-b border-outline pb-4">
    <div class="flex flex-col items-center gap-1">
      <p class="text-md font-medium text-on-surface-strong">{title}</p>
      <h1 class="text-balance text-2xl font-semibold text-on-surface-strong">
        {name}
      </h1>
      {location ? <p class="text-sm text-on-surface">{location}</p> : null}
      <p class="text-sm text-on-surface">{toWeekString(weekStart)}</p>
    </div>
  </div>
);

export default FeaturedPageHeader;
