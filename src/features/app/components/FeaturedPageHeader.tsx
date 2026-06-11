import { toWeekString } from "../../../lib/utils";

type Props = {
  title: string;
  name: string;
  weekStart: Date;
  location?: string | null;
};

const FeaturedPageHeader = ({ title, name, weekStart, location }: Props) => {
  const meta = [location, toWeekString(weekStart)].filter(Boolean).join(" · ");

  return (
    <header class="flex flex-col items-center gap-3 text-center">
      <div class="flex flex-col items-center gap-1">
        <p class="text-md font-medium text-on-surface-strong">{title}</p>
        <h1 class="m-0 text-balance text-2xl font-semibold text-on-surface-strong">
          {name}
        </h1>
      </div>
      {meta ? <p class="text-sm text-on-surface">{meta}</p> : null}
    </header>
  );
};

export default FeaturedPageHeader;
