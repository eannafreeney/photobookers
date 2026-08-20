import clsx from "clsx";

/**
 * Placeholders sized to the section they stand in for. Reserving a full
 * viewport per lazy section (the old behaviour) made the page claim ~2,200px
 * more than it had, so the scrollbar shrank under the reader as fragments
 * arrived.
 */
export type SectionSkeletonVariant =
  | "stats"
  | "circles"
  | "spread"
  | "cards"
  | "grid"
  | "rows"
  | "columns";

const Block = ({ class: className }: { class: string }) => (
  <div
    class={clsx(
      "rounded-radius bg-on-surface/10 motion-safe:animate-pulse",
      className,
    )}
    aria-hidden="true"
  />
);

const Header = () => (
  <div class="mb-6 flex items-end justify-between gap-4 border-t-2 border-on-surface-strong pt-3">
    <div class="flex flex-col gap-2">
      <Block class="h-2.5 w-24" />
      <Block class="h-7 w-44" />
    </div>
    <Block class="h-2.5 w-16" />
  </div>
);

const Row = ({ count, item }: { count: number; item: string }) => (
  <div class="flex gap-4 overflow-hidden">
    {Array.from({ length: count }).map((_, index) => (
      <Block key={index} class={clsx("shrink-0", item)} />
    ))}
  </div>
);

const Body = ({ variant }: { variant: SectionSkeletonVariant }) => {
  switch (variant) {
    case "stats":
      return (
        <div class="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Block key={index} class="h-16 w-full" />
          ))}
        </div>
      );
    case "circles":
      return (
        <div class="flex gap-3 overflow-hidden">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} class="flex shrink-0 flex-col items-center gap-2">
              <Block class="size-24 rounded-full" />
              <Block class="h-4 w-16" />
              <Block class="size-8 rounded-full" />
            </div>
          ))}
        </div>
      );
    case "spread":
      return (
        <div class="grid gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
          <Block class="h-[300px] w-full md:h-[396px]" />
          <div class="flex flex-col justify-center gap-4 bg-surface-alt px-6 py-8 sm:px-10">
            <Block class="h-6 w-full" />
            <Block class="h-6 w-11/12" />
            <Block class="h-6 w-3/4" />
            <Block class="h-6 w-2/3 md:hidden" />
            <Block class="mt-2 h-3 w-32" />
          </div>
        </div>
      );
    case "cards":
      return <Row count={5} item="h-[300px] w-[220px]" />;
    case "grid":
      // Same column classes as BooksGrid so the reserve tracks every
      // breakpoint; heights measured off real cards (464 stacked, 423 in grid).
      return (
        <div class="flex flex-col gap-6">
          <Block class="h-10 w-full" />
          <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 10 }).map((_, index) => (
              <Block key={index} class="h-[464px] w-full lg:h-[423px]" />
            ))}
          </div>
        </div>
      );
    case "rows":
      return (
        <div class="flex flex-col">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              class="flex items-center gap-6 border-t border-outline py-6 first:border-t-0"
            >
              <Block class="h-10 w-20" />
              <div class="flex flex-1 flex-col gap-2">
                <Block class="h-4 w-52" />
                <Block class="h-3 w-72" />
              </div>
            </div>
          ))}
        </div>
      );
    case "columns":
      return (
        <div class="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, index) => (
            <div
              key={index}
              class="flex flex-col gap-2 border-t border-outline py-4 first:border-t-0 sm:first:border-t"
            >
              <Block class="h-4 w-40" />
              <Block class="h-3 w-24" />
            </div>
          ))}
        </div>
      );
  }
};

/** Fragments repeat their call to action below the fold on mobile only. */
const MobileButton = () => (
  <div class="mt-8 flex justify-center md:hidden">
    <Block class="h-11 w-48" />
  </div>
);

const WITH_MOBILE_BUTTON: SectionSkeletonVariant[] = [
  "circles",
  "spread",
  "cards",
  "rows",
  "columns",
];

const SectionSkeleton = ({
  variant,
  withHeader = true,
}: {
  variant: SectionSkeletonVariant;
  withHeader?: boolean;
}) => (
  <div>
    {withHeader ? <Header /> : null}
    <Body variant={variant} />
    {WITH_MOBILE_BUTTON.includes(variant) ? <MobileButton /> : null}
  </div>
);

export default SectionSkeleton;
