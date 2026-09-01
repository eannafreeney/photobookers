import clsx from "clsx";

type Props = {
  href: string;
  imageUrl: string;
  imageAlt: string;
  title: string;
  dateLabel?: string;
  kicker?: string;
  subtitle?: string;
  aspectSquare?: boolean;
  className?: string;
};

/**
 * Editorial card for archive and this-week grids. The whole card links through.
 */
const SpotlightCard = ({
  href,
  imageUrl,
  imageAlt,
  title,
  dateLabel,
  kicker,
  subtitle,
  aspectSquare = false,
  className,
}: Props) => {
  return (
    <a
      href={href}
      class={clsx(
        "group flex flex-col border border-outline bg-surface transition-colors duration-300 hover:border-on-surface-strong",
        className ?? "min-w-[200px] max-w-[24rem]",
      )}
    >
      {dateLabel ? (
        <div class="flex items-center justify-center gap-2 border-b border-outline px-3 py-2">
          <span class="kicker text-accent whitespace-nowrap">{dateLabel}</span>
        </div>
      ) : null}
      <figure
        class={clsx(
          "relative w-full overflow-hidden bg-surface-alt",
          aspectSquare ? "aspect-square" : "aspect-[1]",
        )}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          loading="lazy"
          class="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
        />
      </figure>
      <div class="flex flex-col gap-1 px-3 py-3">
        {kicker ? (
          <span class="kicker text-center text-accent">{kicker}</span>
        ) : null}
        <h3 class="font-display text-lg font-medium text-center leading-snug text-on-surface-strong decoration-accent decoration-2 underline-offset-4 group-hover:underline">
          {title}
        </h3>
        {subtitle ? (
          <p class="kicker text-center text-on-surface-weak">{subtitle}</p>
        ) : null}
      </div>
    </a>
  );
};

export default SpotlightCard;
