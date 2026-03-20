import { Fragment } from "hono/jsx/jsx-runtime";
import { capitalize } from "../../utils";
import Badge from "./Badge";
import Link from "./Link";

const tickerItems = [
  "Discover New Photobooks",
  "Join the Newsletter",
  "Follow Your Favorite Artists and Publishers",
  "Create a Profile",
  "Book of The Week",
  "Artist of The Week",
  "Publisher of The Week",
  "Follow on Instagram",
  "Wishlist Your Favorite Books",
  "Collect Your Favorite Books",
  "Share Your Favorite Books",
];

export default function TickerBanner() {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div class="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden border border-b mt-[73px] md:mt-0">
      <div class="marquee flex w-max items-center gap-2 whitespace-nowrap py-1 text-sm">
        {doubled.map((item, idx) => (
          <Fragment key={`${item}-${idx}`}>
            <span class="text-on-surface tracking-wide">{item}</span>
            {idx < doubled.length - 1 && (
              <span class="text-on-surface/50" aria-hidden="true">
                •
              </span>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
