import { ChildType } from "../../../types";

type PageHeaderProps = {
  title: string;
  kicker?: string;
  intro?: string;
};

const PageHeader = ({ title, kicker, intro }: PageHeaderProps) => (
  <header class="flex flex-col gap-2 border-b-2 border-on-surface-strong pb-6">
    {kicker ? <span class="kicker text-accent">{kicker}</span> : null}
    <h1 class="font-display text-4xl md:text-6xl font-medium leading-tight text-on-surface-strong text-balance">
      {title}
    </h1>
    {intro ? (
      <p class="max-w-2xl text-sm md:text-base text-on-surface text-pretty">
        {intro}
      </p>
    ) : null}
  </header>
);

export default PageHeader;
