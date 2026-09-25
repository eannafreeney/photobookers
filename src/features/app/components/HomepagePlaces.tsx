import SectionHeader from "../../../components/app/SectionHeader";
import { isFeatureEnabledForUser } from "../../../lib/features";
import type { AuthUser } from "../../../../types";

const places = [
  {
    href: "/printers",
    kicker: "Make a book",
    title: "Printers",
    intro: "Printers recommended by the community.",
    feature: "printers" as const,
  },
  {
    href: "/fairs",
    kicker: "Days Out!",
    title: "Book Fairs",
    intro: "Upcoming photobook fairs around the world.",
  },
  {
    href: "/stores",
    kicker: "Shop Local",
    title: "Bookstores",
    intro: "Shops where you can browse and buy photobooks.",
  },
];

const HomepagePlaces = ({ user }: { user: AuthUser | null }) => {
  const links = places.filter(
    (place) => !place.feature || isFeatureEnabledForUser(place.feature, user),
  );

  return (
    <section aria-label="More places">
      <SectionHeader kicker="Look around">More places</SectionHeader>
      <nav class="grid gap-4 md:grid-cols-3">
        {links.map((link) => (
          <a
            href={link.href}
            class="group flex flex-col gap-2 border border-outline p-5 transition-colors hover:border-accent"
          >
            <span class="kicker text-accent">{link.kicker}</span>
            <span class="font-display text-2xl font-medium text-on-surface-strong">
              {link.title}
              <span class="inline-block w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-300 group-hover:w-8 group-hover:opacity-100">
                &nbsp;→
              </span>
            </span>
            <span class="text-pretty text-sm text-on-surface">
              {link.intro}
            </span>
          </a>
        ))}
      </nav>
    </section>
  );
};

export default HomepagePlaces;
