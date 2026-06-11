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
    <header class="flex flex-col items-center gap-3 text-center border-b-2 border-on-surface-strong pb-6">
      <p class="kicker text-accent">{title}</p>
      <h1 class="m-0 text-balance font-display text-3xl md:text-5xl font-medium leading-tight text-on-surface-strong">
        {name}
      </h1>
      {meta ? <p class="kicker text-on-surface-weak">{meta}</p> : null}
    </header>
  );
};

export default FeaturedPageHeader;
