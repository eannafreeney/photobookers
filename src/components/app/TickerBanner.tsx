import Link from "./Link";

const tickerItems = [
  { text: "Discover New Photobooks" },
  { text: "Join the Newsletter" },
  { text: "Follow Your Favorite Artists / Publishers" },
  { text: "Create a Profile" },
  { text: "Book of The Week" },
  { text: "Artist / Publisher of The Week" },
] as const;

export default function TickerBanner({
  durationSeconds = 40,
}: {
  durationSeconds?: number;
}) {
  const doubled = [...tickerItems, ...tickerItems];
  return (
    <div
      class="ticker-banner fixed top-0 left-0 right-0 z-40 md:static md:z-auto border-b border-outline bg-surface"
      style={{ ["--ticker-duration" as any]: `${durationSeconds}s` }}
    >
      <div class="ticker-viewport py-1 flex items-center overflow-hidden whitespace-nowrap leading-none">
        <div
          class="ticker-track inline-flex whitespace-nowrap"
          style={{ gap: 0 }}
        >
          <div class="ticker-seq">
            {doubled.map((it, idx) => (
              <span
                key={idx}
                class="ticker-item inline-flex items-center gap-4 whitespace-nowrap"
              >
                <span class="text-on-surface tracking-wide">{it.text}</span>
                {idx < doubled.length - 1 && (
                  <span class="text-on-surface/50" aria-hidden="true">
                    •
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
